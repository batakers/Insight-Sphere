"""
Sales Repository — Data Access Layer.
Hanya bertugas ngobrol dengan database. Tidak ada logika bisnis di sini.
"""
from sqlalchemy.orm import Session, selectinload
from domains.sales.models import Transaction, TransactionItem
from domains.observability.models import AuditEvent


def get_transactions_with_items(db: Session, skip: int = 0, limit: int = 100):
    """
    Mengambil data transaksi beserta item-nya (Eager Loading).
    Mencegah masalah query N+1.
    """
    return db.query(Transaction).options(
        selectinload(Transaction.items)
    ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()


def get_transaction_by_client_id(db: Session, client_txn_id: str):
    """Ambil transaksi berdasarkan client_txn_id untuk cek idempotency."""
    return db.query(Transaction).filter(Transaction.client_txn_id == client_txn_id).first()


def create_transaction(db: Session, transaction_data, total_amount: float):
    """
    Menyimpan transaksi + items + audit event secara atomic.
    total_amount sudah dihitung oleh service layer.
    """
    try:
        db_transaction = Transaction(
            branch_id=transaction_data.branch_id,
            date=transaction_data.date,
            time=transaction_data.time,
            total_amount=total_amount,
            payment_method=transaction_data.payment_method,
            cashier_id=getattr(transaction_data, "cashier_id", None),
            cash_session_id=getattr(transaction_data, "cash_session_id", None),
            client_txn_id=getattr(transaction_data, "client_txn_id", None)
        )
        db.add(db_transaction)
        db.flush()
        
        db_items = [
            TransactionItem(
                transaction_id=db_transaction.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price_at_time=item.unit_price_at_time,
                subtotal=item.quantity * item.unit_price_at_time
            )
            for item in transaction_data.items
        ]
        db.add_all(db_items)
        
        audit_event = AuditEvent(
            event_type="TRANSACTION_CREATED",
            event_data={
                "branch_id": str(transaction_data.branch_id),
                "total_amount": total_amount,
                "items_count": len(transaction_data.items),
                "payment_method": transaction_data.payment_method,
                "client_txn_id": getattr(transaction_data, "client_txn_id", None)
            }
        )
        db.add(audit_event)
        
        db.commit()
        db.refresh(db_transaction)
        return db_transaction

    except Exception as e:
        db.rollback()
        raise e
