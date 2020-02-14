var webapp = require("express")();
var Aquos = require("../sharp-aquos-remote-control/lib/aquos").Aquos;

// AQUOS接続のための設定
// TODO: IPアドレス、ポート番号、ユーザーID、パスワードを入力する
var control = new Aquos(
  "192.168.0.55",
  10002,
  process.env.aquosID,
  process.env.aquosPass
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
var server = webapp.listen(process.env.EXPRESS_PORT, function() {
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