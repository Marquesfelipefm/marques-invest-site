(function () {
  var COINS = [
    { symbol: "BTCUSDT", short: "BTC" },
    { symbol: "ETHUSDT", short: "ETH" },
    { symbol: "SOLUSDT", short: "SOL" },
    { symbol: "BNBUSDT", short: "BNB" },
    { symbol: "XRPUSDT", short: "XRP" },
    { symbol: "ADAUSDT", short: "ADA" },
    { symbol: "AVAXUSDT", short: "AVAX" },
    { symbol: "DOGEUSDT", short: "DOGE" },
    { symbol: "DOTUSDT", short: "DOT" },
    { symbol: "LINKUSDT", short: "LINK" },
  ];

  function createTicker() {
    var existing = document.querySelector("#crypto-ticker");
    if (existing) return existing.querySelector("#crypto-ticker-items");

    var ribbon = document.querySelector("#market-ribbon");
    var anchor = ribbon || document.querySelector(".topbar");
    if (!anchor) return null;

    var ticker = document.createElement("div");
    ticker.className = "crypto-ticker";
    ticker.id = "crypto-ticker";
    ticker.innerHTML =
      '<span class="crypto-ticker-label">Cripto</span>' +
      '<div class="crypto-ticker-track">' +
      '<div class="crypto-ticker-items" id="crypto-ticker-items"></div>' +
      "</div>";
    anchor.insertAdjacentElement("afterend", ticker);
    return ticker.querySelector("#crypto-ticker-items");
  }

  function fmtPrice(p) {
    var n = parseFloat(p);
    if (n >= 1000)
      return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (n >= 1)
      return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }

  function render(data) {
    var container = createTicker();
    if (!container) return;
    var html = "";
    COINS.forEach(function (coin) {
      var info = data.find(function (d) {
        return d.symbol === coin.symbol;
      });
      if (!info) return;
      var chg = parseFloat(info.priceChangePercent);
      var tone = chg >= 0 ? "positive" : "negative";
      var sign = chg >= 0 ? "+" : "";
      html +=
        '<article class="crypto-ticker-item">' +
        '<span class="crypto-ticker-symbol">' + coin.short + "</span>" +
        '<span class="crypto-ticker-price">$' + fmtPrice(info.lastPrice) + "</span>" +
        '<span class="crypto-ticker-change ' + tone + '">' +
        sign + chg.toFixed(2) + "%</span>" +
        "</article>";
    });
    container.innerHTML = html + html;
  }

  function load() {
    var syms = COINS.map(function (c) {
      return '"' + c.symbol + '"';
    }).join(",");
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbols=[" + syms + "]")
      .then(function (res) { return res.json(); })
      .then(render)
      .catch(function (err) {
        console.warn("Crypto ticker:", err.message);
      });
  }

  load();
  setInterval(load, 60000);
})();
