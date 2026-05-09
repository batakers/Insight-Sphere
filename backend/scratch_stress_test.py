import requests
import time
import concurrent.futures

URL = "http://127.0.0.1:8000/transactions/summary/today"
REQUESTS_COUNT = 200
CONCURRENCY = 20

def fetch_url(url):
    start = time.perf_counter()
    resp = requests.get(url)
    duration = time.perf_counter() - start
    return {"status": resp.status_code, "time": duration}

def main():
    print(f"Memulai Stress Test...")
    print(f"Target: {URL}")
    print(f"Total Requests: {REQUESTS_COUNT}")
    print(f"Konkurensi (Simultan): {CONCURRENCY} pekerja\n")
    
    results = []
    start_total = time.perf_counter()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(fetch_url, URL) for _ in range(REQUESTS_COUNT)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
            
    total_duration = time.perf_counter() - start_total
    
    success = [r for r in results if r["status"] == 200]
    times = [r["time"] for r in success]
    
    avg_time = sum(times) / len(times) if times else 0
    max_time = max(times) if times else 0
    min_time = min(times) if times else 0
    
    print("=== HASIL STRESS TEST ===")
    print(f"Sukses: {len(success)} / {REQUESTS_COUNT}")
    print(f"Total Waktu Pelaksanaan: {total_duration*1000:.2f} ms")
    print(f"Rata-rata Waktu Respons: {avg_time*1000:.2f} ms")
    print(f"Waktu Respons Tercepat: {min_time*1000:.2f} ms")
    print(f"Waktu Respons Terlama: {max_time*1000:.2f} ms")
    print("=========================")

if __name__ == "__main__":
    main()
