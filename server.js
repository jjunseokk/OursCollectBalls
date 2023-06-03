const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require("http");
const port = 5000;

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: 3306,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: 'ours',
});


connection.connect((error) => {
    if (error) {
        console.error('연결 실패:', error);
        return;
    }
    http.createServer(app).listen(port, () => {
        console.log(`app listening at ${port}`);
    });
});




app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
    res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Date: Date.now()
    });
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 예약확정
app.post('/user', (req, res) => {
    const { address, date, service, event, collect, time } = req.body;
    console.log(time);
    if (!address || !date || !service || !collect) {
        res.status(400).json({ error: 'address, date, service, collect 필드가 필요합니다.' });
        return;
    }

    const query = `INSERT INTO tbl_ours_trading (name, cellphone, email, spot ,place, shop, date, timezone, collect, inquiry, event, time) VALUES ('${service.service.name}','${service.service.phoneNumber}','${service.service.email}','${address.add.spot}','${address.add.address}','${address.add.shop}','${date.date}','${date.time}','${collect.collect}','${service.service.inquiry}','${event.event}', '${time.time}' )`;
    const values = [address, date, service, event, collect];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('insert 쿼리 오류:::', error);
            res.status(500).json({ error: '데이터를 삽입하는 중에 오류가 발생했습니다.' });
            return;
        }
        res.json({ success: results });
    });
});


// 예약확인 내역
app.post('/check', (req, res) => {
    const { name, phoneNumber } = req.body;

    const query = `SELECT * FROM tbl_ours_trading WHERE name ='${name}' AND cellphone='${phoneNumber}'`;

    connection.query(query, (error, result) => {
        if (error) {
            console.error('select 쿼리 오류::::', error);
            res.status(500).json({ error: '데이터베이스 조회 중에 오류가 발생했습니다.' });
            return;
        }

        if (result.length > 0) {
            // 레코드가 존재하는 경우
            res.json({ exists: true, result });
        } else {
            // 레코드가 존재하지 않는 경우
            res.json({ exists: false });
        }
        console.log(result);
    });
});

//예약 내역 삭제!!!!
app.post('/delete', (req, res) => {
    console.log("연결", req.body);
    const { date, name } = req.body;

    const query = `DELETE FROM tbl_ours_trading WHERE name='${name}' AND date='${date}'`;

    connection.query(query, (error, result) => {
        if (error) {
            console.error("delete 쿼리 오류:::", error);
        }

        res.json({ result })
    });
});


// qving 매장 db 접근
app.post('/qving', (req, res) => {
    console.log("연결");

    const query = `SELECT a.* FROM tbl_com_code_store a INNER JOIN tbl_machine_master b ON b.com_code_store_num = a.num AND b.mac_type IN ('QB','QK') WHERE NOT (com_code_store_name LIKE '%(철수)%' OR com_code_store_name LIKE '%테스트%' OR com_code_store_name LIKE '%LENOVO%' OR com_code_store_name LIKE '%성남4차매장%' OR com_code_store_name LIKE '%사이니지%')
    UNION
    SELECT * FROM tbl_ours_store`;

    // const query = `SELECT a.* FROM tbl_com_code_store a INNER JOIN tbl_machine_master b ON b.com_code_store_num = a.num AND b.mac_type IN ('QB','QK') WHERE 1=1
    // UNION
    // SELECT * FROM tbl_ours_store`;

    connection.query(query, (error, result) => {
        if (error) {
            console.error('delete 쿼리 오류:::', error);
        }

        res.json({ data: result });
    })
});

// ours DB에 추가.
app.post('/addData', (req, res) => {
    const { shop, address, phone } = req.body;

    const query = `INSERT INTO tbl_ours_store (com_code_store_name, com_address1, hphone) VALUES ('${shop}', '${address}', '${phone}')`;

    connection.query(query, (error, result) => {
        if (error) {
            console.error('DB추가 오류', error);
        }
        res.json({ data: result });
    })
})

// 서버 종료 시 MySQL 연결을 끊습니다.
process.on('SIGINT', () => {
    connection.end();
    process.exit();
});
