import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import "../style/Transaction.css";

const Transaction = () => {
  const { buyer_id } = useParams();
  const [transaction, setTransaction] = useState(null);


  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/transactions/${buyer_id}`)
      .then((response) => {
        if (response.data.Status === "Success") {
          setTransaction(response.data.transaction);
        }
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  }, [buyer_id]);

  if (!transaction) return <div>Loading...</div>;

  return (
    <div className="transaction-container">
      <div style={{ padding: "2rem" }}>
        <Link to="/gameshop" className="arrow-to-home">
          <FaArrowLeft />
          Store
        </Link>
      </div>

      <div className="transaction-detials-container">
        <div className="transaction-detials-container-1">
          <h2>Transaction History</h2>
          <h3>
            Buyer name: {transaction.buyer_name} 
          </h3>
          <h3>
          Email: ({transaction.buyer_email})
          </h3>
          <p>Payment Method: Credit Card</p>
            <p>Delivery Method: Digital</p>
          
        </div>
      
        <ul className="transaction-detials-container-2">
          {transaction.games.map((game, index) => (
            <li key={index} style={{display : 'flex' , marginBottom : '10px' , columnGap : '2rem' , alignItems : 'center'}}>
             
              <img
                
                src={game.cover_image}
                alt={`${game.title} cover`}
                style={{ width: "150px", height: "100px" , borderRadius : '10px'}}
              />
                <div>
                <p>Game Title: {game.title}</p>
                <p style={{margin : '0px'}}>Game Price: ฿{game.price}</p>
                </div>
            </li>
          ))}
        </ul>
        
        <ul className="transaction-detials-container-3">
          {transaction.games.map((game, index) => (
            <li key={index} style={{listStyle : 'none'}}>
                
              <p style={{display : 'flex' ,justifyContent : 'space-between'}}><span>Items {index +1}:  </span> ฿{game.price}</p>
              
             
            </li>
            
          ))}
          
          <p style={{display : 'flex' , justifyContent : 'space-between' , fontSize : '1.5rem', fontWeight : 'bold' , color : '#36d399'}}><span>Total Price:</span> ฿{transaction.total_price}</p>
        </ul>
      </div>
    </div>
  );
};

export default Transaction;
