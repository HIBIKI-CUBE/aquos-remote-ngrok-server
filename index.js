const app = require("express")();
const Aquos = require("../sharp-aquos-remote-control/lib/aquos").Aquos;
const fs = require("fs");
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

// AQUOS接続のための設定
// TODO: IPアドレス、ポート番号、ユーザーID、パスワードを入力する
const control = new Aquos(
  "192.168.0.55",
  10002,
  config.id,
  config.pass
);

// 電源をつける操作のエンドポイント
app.get("/power", (req, res) => {
  if (req.query.v == "on") {
    control.power(true, (err, data) => {
      console.log("Power on");
      res.sendStatus("202");
      return;
    });
  } else if (req.query.v == "off") {
    control.power(false, (err, data) => {
      console.log("Power off");
      res.sendStatus("202");
      return;
    });
  } else if (req.query.v == "toggle") {
    control.power(null, (err, data) => {
      console.log("Toggle power");
      control.power(!Number(data), (err, data2) => {
        console.log(!Number(data)?"Power on":"Power off")
        res.send(data[0]);
        return;
      });
    });
  } else {
    control.power(null, (err, data) => {
      console.log("Return power status");
      console.log(data);
      res.send(data[0]);
      return;
    });
  }
});

app.get("/channel", (req, res) => {
  if (1 <= Number(req.query.v) && Number(req.query.v) <= 12) {
    control.channel(`${Number(req.query.v)}1`, (err, data) => {
      console.log("Set channel " + String(req.query.v));
      console.log(data);
      res.send("Set channel " + String(req.query.v));
      return;
    });
  } else if (String(req.query.v).match(/^\d{3}$/g)) {
    control.channel(String(req.query.v), (err, data) => {
      console.log("Set channel " + String(req.query.v));
      res.send("Set channel " + String(req.query.v));
      return;
    });
  } else if (req.query.v == "up") {
    control.channelUp(() => {
      console.log("Channel up");
      res.sendStatus(200);
      return;
    });
  } else if (req.query.v == "down") {
    control.channelDown(() => {
      console.log("Channel down");
      res.sendStatus(200);
      return;
    });
  } else {
    control.channel(null, (err, data) => {
      console.log("Return channel status");
      console.log(data);
      res.send(data);
      return;
    })
  }
});

app.get("/volume", (req, res) => {
  if (0 <= Number(req.query.v) && Number(req.query.v) <= 100) {
    control.volume(String(req.query.v), (err, data) => {
      console.log("Set volume " + String(req.query.v));
      res.send("Set volume " + String(req.query.v));
      return;
    });
  } else if (req.query.v.toLowerCase() == "up") {
    control.volume(null, (err, data) => {
      control.volume(Number(data)+1, (err, data2) => {
        console.log("Set volume " + String(Number(data)+1));
        res.send("Set volume " + String(Number(data)+1));
        return;
      })
    });
  } else if (req.query.v.toLowerCase() == "down") {
    control.volume(null, (err, data) => {
      control.volume(Number(data)-1, (err, data2) => {
        console.log("Set volume " + String(Number(data)-1));
        res.send("Set volume " + String(Number(data)-1));
        return;
      })
    });
  }
});

// サーバーの作成
const server = app.listen(55555, () => {
  var host = server.address().address,
    port = server.address().port;

  console.log("listening at http://%s:%s", host, port);
  control.connect(err => {
    if (err) {
      console.log(err);
      return;
    }
  });
});