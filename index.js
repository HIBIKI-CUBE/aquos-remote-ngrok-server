const webapp = require("express")();
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
webapp.get("/turnon", function(req, res) {
  control.power(true, function(err, data) {
    console.log("power on.");
    res.status(200).send("");
    return;
  });
});

// 電源を消す操作のエンドポイント
webapp.get("/turnoff", function(req, res) {
  control.power(false, function(err, data) {
    console.log("power off.");
    res.status(200).send("");
    return;
  });
});

// サーバーの作成
const server = webapp.listen(process.env.EXPRESS_PORT, function() {
  var host = server.address().address,
    port = server.address().port;

  console.log("listening at http://%s:%s", host, port);
  control.connect(function(err) {
    if (err) {
      console.log(err);
      return;
    }
  });
});