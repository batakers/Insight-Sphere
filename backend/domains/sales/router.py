"""
Sales Router — HTTP Endpoint Layer.
Kurus dan bersih: hanya menerima request, delegasi ke service, kembalikan response.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from domains.sales.schemas import (
    TransactionCreate, TransactionResponse, TransactionBatchCreate, BatchSyncResponse
)
from domains.sales import service as sales_service
from domains.sales import repository as sales_repo

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """
    Endpoint Kasir:
    Mencatat totalan keranjang transaksi baru. Memfilter input kotor via Pydantic Data Contracts.
    """
    try:
        return sales_service.create_single_transaction(db, transaction)
    except ValueError as e:
        if str(e) == "STOK_CONFLICT":
            raise HTTPException(status_code=409, detail="Stock version conflict. Another transaction updated this stock.")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error during checkout.")


@router.post("/batch", status_code=207)
def sync_offline_transactions(batch: TransactionBatchCreate, db: Session = Depends(get_db)):
    """
    Offline Sync Endpoint:
    Menerima tumpukan keranjang transaksi dari browser kasir yang sempat mati internet.
    """
    return sales_service.sync_offline_transactions(db, batch)


@router.get("/", response_model=List[TransactionResponse])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Endpoint Dashboard Admin:
    Mengambil list transaksi dengan efisien (Eager Loading).
    """
    return sales_repo.get_transactions_with_items(db, skip=skip, limit=limit)


@router.get("/summary/today")
def get_today_summary(
    branch_id: Optional[str] = Query(None, description="Specific branch UUID"),
    db: Session = Depends(get_db)
):
    """
    Live Summary Dashboard:
    Menghitung total omzet hari ini menggunakan agregasi langsung tingkat DB.
    """
    return sales_service.get_today_summary(db, branch_id)
