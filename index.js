const bodyParser = require('body-parser'),
      Aquos = require("../sharp-aquos-remote-control/lib/aquos").Aquos,
      app = require("express")(),
      fs = require("fs"),
      config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
app.use(bodyParser.urlencoded({ extended: true }));

const control = new Aquos(
  "192.168.0.55",
  10002,
  config.id,
  config.pass
);

control.connect(err => {
  if (err) {
    console.log(err);
    return;
  }
});

function power(arg, res) {
  control.power(arg, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(202);
      return;
    }
    res.send(Number(data) ? String(Number(data)) : String(data));
  });
}

function volume(arg, res) {
  control.volume(arg, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(202);
      return;
    }
    res.send(Number(data) ? String(Number(data)) : String(data));
  });
}

function channel(arg, res) {
  control.channel(arg, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(202);
      return;
    }
    res.send(Number(data) ? String(Number(data)) : String(data));
  });
}

function input(arg, res) {
  control.input(arg, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(202);
      return;
    }
    res.send(Number(data) ? String(Number(data)) : String(data));
  });
}

app.post("/", (req, res) => {
  const request = {
    power: req.body.power,
    volume: req.body.volume,
    channel: req.body.channel,
    input: req.body.input,
    value: req.body.value
  }
  if (request.power == "check") {
    return power(null, res);
  } else if (request.power == "on") {
    return power(true, res);
  } else if (request.power == "off") {
    return power(false, res);
  } else if (request.power == "toggle") {
    control.power(null, (err, data) =>
      control.power(!Number(data), (err, data2) => res.send(String(Number(data))))
    );
    return;
  }

  if (request.channel == "check") {
    return channel(null, res);
  } else if (1 <= Number(request.channel) && Number(request.channel) <= 12) {
    return channel(`${Number(request.channel)}1`, res);
  } else if (String(request.channel).match(/^\d{3}$/g)) {
    return channel(String(request.channel), res);
  } else if (request.channel == "up") {
    control.channelUp(() => res.sendStatus(200));
    return;
  } else if (request.channel == "down") {
    control.channelDown(() => res.sendStatus(200));
    return;
  }

  if (request.volume == "check") {
    return volume(null, res);
  } else if (0 <= Number(request.volume) && Number(request.volume) <= 100) {
    return volume(String(request.volume), res);
  } else if (request.volume == "up") {
    const value = Number(request.value) ? Number(request.value) : 1;
    control.volume(null, (err, data) =>
      control.volume(Number(data) + value, (err, data2) => res.send(String(Number(data) + value)))
    );
    return;
  } else if (request.volume == "down") {
    const value = Number(request.value) ? Number(request.value) : 1;
    control.volume(null, (err, data) =>
      control.volume(Number(data) - value, (err, data2) => res.send(String(Number(data) - value)))
    );
    return;
  }

  if (request.input == "check") {
    return input(null, res);
  } else if (1 <= Number(request.input) && Number(request.input) <= 5) {
    return input(Number(request.input), res);
  }
});

// 電源をつける操作のエンドポイント
app.get("/power", (req, res) => {
  if (req.query.v == "on") {
    return power(true, res);
  } else if (req.query.v == "off") {
    return power(false, res);
  } else if (req.query.v == "toggle") {
    control.power(null, (err, data) =>
      control.power(!Number(data), (err, data2) => res.send("status "+String(Number(data))))
    );
    return;
  } else {
    return power(null, res);
  }
});

app.get("/channel", (req, res) => {
  if (1 <= Number(req.query.v) && Number(req.query.v) <= 12) {
    return channel(`${Number(req.query.v)}1`, res);
  } else if (String(req.query.v).match(/^\d{3}$/g)) {
    return channel(String(req.query.v), res);
  } else if (req.query.v == "up") {
    return control.channelUp(() => res.sendStatus(200));
  } else if (req.query.v == "down") {
    return control.channelDown(() => res.sendStatus(200));
  } else {
    return channel(null, res);
  }
});

app.get("/volume", (req, res) => {
  if (0 <= Number(req.query.v) && Number(req.query.v) <= 100) {
    return volume(String(req.query.v), res);
  } else if (req.query.v == "up") {
    control.volume(null, (err, data) =>
      control.volume(Number(data) + 1, (err, data2) => res.send(String(Number(data) + 1)))
    );
    return;
  } else if (req.query.v == "down") {
    control.volume(null, (err, data) =>
      control.volume(Number(data) - 1, (err, data2) => res.send(String(Number(data) + 1)))
    );
    return;
  } else {
    return volume(null, res);
  }
});

app.get("/input", (req, res) => {
  if (1 <= Number(req.query.v) && Number(req.query.v) <= 5) {
    return input(Number(req.query.v), res);
  } else {
    return input(null, res);
  }
})

// サーバーの作成
const server = app.listen(55555, () => {
  const host = server.address().address,
        port = server.address().port;

  console.log("listening at http://%s:%s", host, port);
});