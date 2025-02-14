'use client';

import { useState, useEffect } from "react";

export default function POSApp() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState({ PRD_ID: 0, NAME: "", CODE: "", PRICE: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [cart, setCart] = useState([]);
  const [showEmptyCartMessage, setShowEmptyCartMessage] = useState(false); // ✅ 購入時のみエラーメッセージ表示

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 商品検索
  const fetchProduct = async () => {
    if (!barcode.trim()) {
      setErrorMessage("商品コードを入力してください");
      return;
    }

    setErrorMessage(""); // 前回のエラーをクリア

    try {
      const response = await fetch(`${API_URL}/products/${barcode}`);

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          setErrorMessage("商品がマスタ未登録です");
          setProduct({ PRD_ID: 0, NAME: "", CODE: "", PRICE: 0 });
          return;
        }
        setErrorMessage(errorData.detail || "エラーが発生しました");
        setProduct({ PRD_ID: 0, NAME: "", CODE: "", PRICE: 0 });
        return;
      }

      const data = await response.json();
      console.log("取得した商品:", data);

      setProduct({
        PRD_ID: data.PRD_ID,
        NAME: data.NAME,
        CODE: data.CODE,
        PRICE: data.PRICE
      });

      setErrorMessage("");

    } catch (error) {
      console.error("商品取得エラー:", error);
      setErrorMessage("サーバーエラーが発生しました。");
      setProduct({ PRD_ID: 0, NAME: "", CODE: "", PRICE: 0 });
    }
  };

  // カートに追加
  const handleAdd = () => {
    if (product.NAME) {
      const newItem = {
        PRD_ID: product.PRD_ID,
        NAME: product.NAME,
        CODE: product.CODE,
        PRICE: product.PRICE
      };
      console.log("カートに追加:", newItem);
      setCart([...cart, newItem]);
      setProduct({ PRD_ID: 0, NAME: "", CODE: "", PRICE: 0 });
      setBarcode("");
    }
  };

  // 購入処理
  const handlePurchase = async () => {
    if (cart.length === 0) {
      setShowEmptyCartMessage(true); // ✅ 購入時にエラーメッセージ表示
      return;
    }

    try {
      const formattedItems = cart.map(item => ({
        PRD_ID: item.PRD_ID,
        CODE: item.CODE,
        NAME: item.NAME,
        PRICE: item.PRICE
      }));

      let empCd = ""; // 初期値を空にする（サーバー側で "9999999999" を適用）

      console.log("送信データ:", { emp_cd: empCd, items: formattedItems });

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emp_cd: empCd,
          items: formattedItems,
        }),
      });

      if (!response.ok) {
        throw new Error("取引の登録に失敗しました");
      }

      const data = await response.json();
      alert(`購入が完了しました。合計金額: ${data.TOTAL_AMT}円`);
      setCart([]);
      setShowEmptyCartMessage(false); // ✅ 購入完了後にエラーメッセージをリセット

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-10 w-screen min-h-screen bg-gray-100">
    
      {/* 商品入力 */}
      <div className="card w-full max-w-sm bg-white shadow-md rounded-none p-4">
        <div className="card-body">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="商品コードを入力"
            className="input input-bordered w-full text-center"
          />
          <button onClick={fetchProduct} className="btn btn-accent w-full mt-2">
            商品コード 読み込み
          </button>
          <div className="text-center mt-4">
            {errorMessage ? (
              <p className="text-pink-400">{errorMessage}</p>
            ) : (
              <>
                <p className="text-md font-semibold">{product.NAME || "商品名"}</p>
                <p className="text-gray-700">{product.PRICE ? `${product.PRICE}円` : "価格"}</p>
              </>
            )}
            <button onClick={handleAdd} className="btn btn-warning w-full mt-2" disabled={!product.NAME}>
              追加
            </button>
          </div>
        </div>
      </div>

      {/* 購入リスト */}
      <div className="card w-full max-w-sm bg-white shadow-md rounded-none p-4 mt-4">
        <div className="card-body">
          <h2 className="text-lg font-bold">購入リスト</h2>
          <div className="mt-2 border-t pt-2">
            {showEmptyCartMessage && <p className="text-pink-400">購入リストが空です</p>} {/* ✅ 追加 */}
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <p className="text-gray-800 text-sm">
                  {item.NAME} <span className="mx-1">x1</span> <span className="ml-2">{item.PRICE}円</span>
                </p>
                <button
                  onClick={() => setCart(cart.filter((_, i) => i !== index))}
                  className="btn btn-square btn-xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button onClick={handlePurchase} className="btn btn-accent w-full mt-4">
            購入
          </button>
        </div>
      </div>
    </div>
  );
}
