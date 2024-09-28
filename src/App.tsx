import './App.css';
import { useState, useEffect, useRef, useCallback } from "react";
import { getMockData, MockDataResult, MockData, DEFAULT_PAGE } from './data';

function App() {

  const [productList, setProductList] = useState<MockData[]>([]);
  const [page, setPage] = useState(DEFAULT_PAGE);

  const [loading, setLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(true);
  // IntersectionObserver 인스턴스를 참조하기 위한 useRef
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      // observerRef.current = new IntersectionObserver((entries) => {
      //   if (entries[0].isIntersecting && isEnd) {
      //     setPage((prevPage) => prevPage + 1);
      //   }
      // });
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && isEnd) {
          setPage((prevPage) => prevPage + 1);
        }
      }, {
        threshold: 0.5,
        rootMargin: '100px',
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, isEnd],
  );
  
  useEffect(() => {
    let didCancel = false;  // 중복 요청 방지 플래그

    console.log(`page: `, page)
    setLoading(true);
    getMockData(page)
      .then((response: MockDataResult) => {
        // setProductList((prev) => [...prev, ...response.datas]);
        // setIsEnd(!response.isEnd);
        // setLoading(false);
        if (!didCancel) {  // 컴포넌트가 언마운트되거나 중복 요청 시 실행 방지
          setProductList((prev) => {
            const newProducts = response.datas.filter(
              (newProduct) => !prev.some((product) => product.productId === newProduct.productId)
            );
            return [...prev, ...newProducts];
          });
          setIsEnd(!response.isEnd);
          setLoading(false);
        }
        // setProductList((prev) => [...prev, ...response.datas]);
        // setIsEnd(!response.isEnd);
        // setLoading(false);
      })
      .catch((err) => {
        if (!didCancel) {
          console.error('Error fetching data:', err);
          setLoading(false);
        }
        // console.error('Error fetching data:', err);
        // setLoading(false);
      });
  }, [page])

  const totalPrice = productList.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="App">
      <h1>상품 리스트</h1>
      <ul>
        {productList.map((product, index) => (
          <li 
            key={product.productId}
          >
            <div 
              ref={index === productList.length - 1 ? lastProductRef : null}
              style={{margin: "10px", fontSize: "15px"}}
            >
              {product.productName} : {product.price} 원
            </div>
          </li>
        ))}
      </ul>
      <div>
        <h2>총 가격: {totalPrice} 원</h2>
      </div>
      {loading && <div>로딩 중...</div>}
      {!isEnd && (
          <div>더 이상 데이터가 없습니다.</div>
      )}
    </div>
  );
}

export default App;
