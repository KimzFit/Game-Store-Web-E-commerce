const cors = require('cors');
const express = require("express");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const pg = require('pg')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')


const salt = 10;
const port = process.env.PORT || 8081


dotenv.config()

const app = express();
app.use(express.json());
app.use(cors({
    origin : ["http://localhost:3000"],
    methods : ["POST" , "GET", "DELETE", "PUT"],
    credentials : true
}));
app.use(cookieParser());

const db = new pg.Pool({
  user : process.env.DATABASE_USER,
  host : process.env.DATABASE_HOST,
  database : process.env.DATABASE_NAME,
  password : process.env.DATABASE_PASSWORD,
  port : process.env.DATABASE_PORT,
})

db.connect((err)=>{
  if(err){
    console.log("เชื่อมต่อกับฐานข้อมูลล้มเหลว", err)
  }
})





db.connect((err) => {
    if (err) {
        console.error('เชื่อมต่อฐานข้อมูลล้มเหลว:', err);
    } else {
        console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
    }
});



const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Error: "เข้าสู่ระบบเพื่อใช้งาน" });
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json({ Error: "Token is not okay" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};


app.get('/', verifyUser, (req, res) => {
  return res.json({ Status: "Success", email: req.email });
});

app.get('/getUserByEmail/:email', async (req, res) => {
  const email = req.params.email;
  const sql = "SELECT * FROM Users WHERE email = $1";
  try {
    const result = await db.query(sql, [email]);
    if (result.rows.length > 0) {
      return res.json({ Status: 'Success', user: result.rows[0] });
    } else {
      return res.json({ Status: 'Error', Error: 'User not found' });
    }
  } catch (err) {
    return res.json({ Status: 'Error', Error: err.message });
  }
});


app.post('/updateUserByEmail/:email', async (req, res) => {
  const email = req.params.email;
  const { full_name, address, phone_number, profile_picture } = req.body;
  try {
 
    const getUserSql = 'SELECT profile_picture FROM Users WHERE email = $1';
    const userResult = await db.query(getUserSql, [email]);

    
    const updatedProfilePicture = profile_picture || (userResult.rows.length > 0 ? userResult.rows[0].profile_picture : null);

   
    const updateSql = 'UPDATE Users SET full_name = $1, address = $2, phone_number = $3, profile_picture = $4 WHERE email = $5';
    const updateResult = await db.query(updateSql, [full_name, address, phone_number, updatedProfilePicture, email]);

    if (updateResult.rowCount > 0) {
      return res.json({ Status: 'Success' });
    } else {
      return res.json({ Status: 'Error', Error: 'User not found or not updated' });
    }
  } catch (err) {
    return res.json({ Status: 'Error', Error: err.message });
  }
});


app.post('/register', async (req, res) => {
  const sql = "INSERT INTO Users (username, password, email) VALUES ($1, $2, $3)";
  try {
    const hash = await bcrypt.hash(req.body.password.toString(), 10);
    const values = [req.body.username, hash, req.body.email];
    await db.query(sql, values);
    return res.json({ Status: "Success" });
  } catch (err) {
    return res.json({ Error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล", Detail: err.message });
  }
});


app.post('/login', async (req, res) => {
  const sql = 'SELECT * FROM Users WHERE username = $1';
  try {
    const result = await db.query(sql, [req.body.username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(req.body.password.toString(), user.password);
      if (match) {
        const token = jwt.sign({ email: user.email }, "jwt-secret-key", { expiresIn: '1d' });
        res.cookie('token', token);
        return res.json({ Status: "Success" });
      } else {
        return res.json({ Status: "Password not matched" });
      }
    } else {
      return res.json({ Error: "โปรดกรอก Username และ Password" });
    }
  } catch (err) {
    return res.json({ Error: "Login error in server", Detail: err.message });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: "Success" });
});




app.get('/api/games', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM games');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ Error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเกมจากฐานข้อมูล' });
  }
});


app.get('/api/games/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM games WHERE game_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ Error: 'ไม่พบเกมที่ต้องการ' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching game by ID:', err);
    res.status(500).json({ Error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเกมจากฐานข้อมูล' });
  }
});

app.post('/api/createTransaction', async (req, res) => {
  const { buyer_id, seller_id, games, total_price, payment_method, delivery_method } = req.body;

  if (!buyer_id || !seller_id || !games || !total_price || !payment_method || !delivery_method) {
    return res.status(400).json({ Status: 'Failed', Message: 'Invalid transaction data' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    for (const game of games) {
      await client.query(
        `INSERT INTO transactions (buyer_id, seller_id, game_id, total_price, payment_method, delivery_method)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [buyer_id, seller_id, game.game_id, total_price, payment_method, delivery_method]
      );
    }

    await client.query('COMMIT');
    res.json({ Status: 'Success', Message: 'Transaction recorded successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', err);
    res.status(500).json({ Status: 'Failed', Message: 'Transaction failed during insertion' });
  } finally {
    client.release();
  }
});


app.post('/wishlist', async (req, res) => {
  const { user_id, game_id } = req.body;

  try {
    const result = await db.query('SELECT * FROM wishlist WHERE user_id = $1 AND game_id = $2', [user_id, game_id]);

    if (result.rows.length === 0) {
 
      const insertResult = await db.query(
        'INSERT INTO wishlist (user_id, game_id) VALUES ($1, $2) RETURNING wishlist_id',
        [user_id, game_id]
      );
      res.json({ Status: 'Success', Message: 'Added to wishlist', wishlist_id: insertResult.rows[0].wishlist_id });
    } else {
      
      await db.query('DELETE FROM wishlist WHERE user_id = $1 AND game_id = $2', [user_id, game_id]);
      res.json({ Status: 'Success', Message: 'Removed from wishlist' });
    }
  } catch (err) {
    console.error('Error updating wishlist:', err);
    res.status(500).json({ Status: 'Error', Error: err.message });
  }
});

  

app.post('/api/cart', async (req, res) => {
  const { user_id, game_id, quantity } = req.body;
  const sql = 'INSERT INTO Cart (user_id, game_id, quantity) VALUES ($1, $2, $3)';

  try {
    await db.query(sql, [user_id, game_id, quantity]);
    res.status(201).send('Game added to cart');
  } catch (error) {
    console.error('Error adding game to cart:', error);
    res.status(500).send('Error adding game to cart');
  }
});

app.delete('/api/cart/:user_id/:game_id', async (req, res) => {
  const { user_id, game_id } = req.params;
  const sql = 'DELETE FROM Cart WHERE user_id = $1 AND game_id = $2';

  try {
    const result = await db.query(sql, [user_id, game_id]);
    console.log('Game removed from cart:', result);
    res.status(200).send('Game removed from cart');
  } catch (error) {
    console.error('Error removing game from cart:', error);
    res.status(500).send('Error removing game from cart');
  }
});

app.get('/api/cart/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT Cart.game_id, Games.title, Games.price, Cart.quantity 
    FROM Cart 
    JOIN Games ON Cart.game_id = Games.game_id 
    WHERE Cart.user_id = $1
  `;

  try {
    const result = await db.query(query, [user_id]);
    const cartItems = result.rows;
    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    res.status(200).json({ cartItems, totalPrice });
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).json({ error: 'Error fetching cart items' });
  }
});

app.get('/wishlist/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const sql = 'SELECT game_id FROM Wishlist WHERE user_id = $1';

  try {
    const result = await db.query(sql, [user_id]);
    res.json({
      Status: 'Success',
      wishlist: result.rows,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ Status: 'Error', Message: 'Error fetching wishlist' });
  }
});

  
app.get('/api/transactions/:buyer_id', async (req, res) => {
  const { buyer_id } = req.params;

  const query = `
    SELECT 
      Games.title AS game_title,
      Games.price AS game_price,
      Games.cover_image AS cover_image,
      Transactions.total_price,
      Transactions.purchase_date,
      Transactions.payment_method,
      Transactions.delivery_method,
      Transactions.status,
      Users.full_name AS buyer_name,
      Users.email AS buyer_email
    FROM Transactions
    JOIN Games ON Transactions.game_id = Games.game_id
    JOIN Users ON Transactions.buyer_id = Users.user_id
    WHERE Transactions.buyer_id = $1
    ORDER BY Transactions.purchase_date DESC
  `;

  try {
    const { rows } = await db.query(query, [buyer_id]);

    if (rows.length === 0) {
      return res.status(404).json({ Status: "Error", Message: "No transactions found" });
    }

    const combinedTransaction = {
      buyer_name: rows[0]?.buyer_name,
      buyer_email: rows[0]?.buyer_email,
      total_price: rows.reduce((acc, row) => acc + row.game_price, 0),
      games: rows.map(row => ({
        title: row.game_title,
        price: row.game_price,
        cover_image: row.cover_image,
        purchase_date: row.purchase_date,
        payment_method: row.payment_method,
        delivery_method: row.delivery_method,
        status: row.status,
      })),
    };

    res.json({ Status: "Success", transaction: combinedTransaction });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ Status: "Error", Message: "Error fetching transactions" });
  }
});

app.delete('/api/clearCart/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const query = 'DELETE FROM Cart WHERE user_id = $1';

  try {
    const result = await db.query(query, [user_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ Status: "Error", Message: "No items found in cart to delete" });
    }

    console.log('Cart cleared for user:', user_id);
    res.status(200).send('Cart cleared successfully');
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).send('Error clearing cart');
  }
});

 // Get reviews for a specific game
app.get('/api/reviews/:game_id', async (req, res) => {
  const { game_id } = req.params;

  const query = `
    SELECT r.review, r.rating, r.review_date, u.username
    FROM reviews AS r
    JOIN Users AS u ON r.user_id = u.user_id
    WHERE r.game_id = $1
    ORDER BY r.review_date DESC
  `;

  try {
    const { rows } = await db.query(query, [game_id]);
    res.status(200).json({ Status: "Success", reviews: rows });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ Status: "Error", Message: "Error fetching reviews" });
  }
});


app.post('/api/reviews', async (req, res) => {
  const { user_id, game_id, rating, review } = req.body;

  const query = `
    INSERT INTO Reviews (user_id, game_id, rating, review) 
    VALUES ($1, $2, $3, $4)
  `;

  try {
    await db.query(query, [user_id, game_id, rating, review]);
    res.status(201).json({ Status: "Success", message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ Status: "Error", Message: "Error adding review" });
  }
});

app.listen(port, () => {
    console.log("เซิร์ฟเวอร์กำลังทำงานบนพอร์ต 8081...");
});
