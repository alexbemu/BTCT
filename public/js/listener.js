let connected = false;

function getBaseCurrency(pair) {
    if (pair.startsWith('DASH')) {
        return pair.substr(4, 3);
    } else if (pair.startsWith('GNO') || pair.startsWith('BCH')|| pair.startsWith('EOS')) {
        return pair.substr(3,3);
    } else {
        return pair.substr(5, 4);
    }
}

function getQuoteCurrency(pair) {
    if (pair.startsWith('DASH')) {
        return pair.substr(0, 4);
    } else if (pair.startsWith('GNO') || pair.startsWith('BCH')|| pair.startsWith('EOS')) {
        return pair.substr(0,3);
    } else {
        return pair.substr(1, 3);
    }
}

var urlParts = window.location.href.split("/").filter(function(n){ return n !== "" });

var exchange = urlParts[urlParts.length - 2];
var pair = urlParts[urlParts.length - 1];
var pairParts = [];

if(exchange === "poloniex" || exchange === "cryptopia") {
    pairParts = pair.split('_');
}

if(exchange === "bittrex") {
    pairParts = pair.split('-');
}

if(exchange === "kraken") {
    pairParts = [getBaseCurrency(pair), getQuoteCurrency(pair)];
}



function processMessage(event) {

    var input = JSON.parse(event.data);
    console.log(input);

    if(input.exchange !== exchange || input.pair !== pair) {
        return;
    }

    if(input.event !== 'gunbot' && input.event !== 'check_license') {
        console.log(input);
    }

    if(input.error !== false) {
        $("." + input.exchange + "." + input.pair + ".messages_list").prepend("<li class='error-message'>" + input.error + "</li>");
    }

    switch (input.event) {
        case 'getting_balances':

            console.log(pairParts);

            var dataElement1 = input.data[pairParts[0]];
            dataElement1.header = pairParts[0];

            var dataElement2 = input.data[pairParts[1]];
            dataElement2.header = pairParts[1];


            var formattedData = [dataElement1, dataElement2];
            console.log(formattedData);

            $('table.getting_balances.' + input.exchange + "." + input.pair).dynatable({
                features: {
                    paginate: false,
                    sort: false,
                    pushState: false,
                    search: false,
                    recordCount: false,
                    perPageSelect: false
                },
                dataset: {
                    records: formattedData
                }

            });
            break;

        case 'gettting_trade_history':
        case 'getting_open_orders':
            console.log(input.pair);


            $('table.' + input.event + '.' + input.exchange + "." + input.pair).dynatable({
                dataset: {
                    records: input.data
                }
            });
            break;

        case 'getting_order_book':
        case 'getting_public_trade_history':
        case 'getting_ta':
        case 'sell_trade':
        case 'sell_trailing_stop':
        case 'getting_ema_1':
        case 'getting_ema_2':
        case 'buy_trade':
            for (var k in input.data) {
                if (input.data.hasOwnProperty(k)) {
                    $("." + input.exchange + "." + input.pair + "." + input.event + "." + k).text(input.data[k]);
                }
            }
            break;
        case 'message':
            var message = input.data;
            $("." + input.exchange + "." + input.pair + ".messages_list").prepend("<li>" + message + "</li>");

    }

}

setInterval(()=>{

    // console.log("tick");

    if (connected)
        return false;

    var exampleSocket = new WebSocket("wss://127.0.0.1:5000/?gui=native");
    console.log("connected");
    connected = true;

    exampleSocket.onmessage = processMessage;

    exampleSocket.onerror = function (event) {
        connected = false;
        console.log(event);
    };

    // Dummy data

    // $('table.getting_open_orders').dynatable({
    //     dataset: {
    //         records: [{"orderNumber":"120466","type":"sell","rate":"0.025","amount":"100","total":"2.5"},{"orderNumber":"120467","type":"sell","rate":"0.04","amount":"100","total":"4"} ]
    //     }
    // });





}, 1000);