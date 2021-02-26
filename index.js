const express = require("express");
let path = require('path')
let cors = require('cors');
const ejs = require('ejs');
const https = require("https");
const qs = require("querystring");
const feedback = require('./feedback')

// const checksum_lib = require("./Paytm/checksum");
// const config = require("./Paytm/config");

const app = express();
app.use(cors());
app.set('view engine', 'ejs');
let profile = require('./profile');

const checksum_lib = require("./Paytm/checksum");
const config = require("./Paytm/config");

let mongoose = require('mongoose');
const controller = require("./controller");
mongoose.connect("mongodb+srv://akash:akash1234@cluster0.4ayge.mongodb.net/test?retryWrites=true&w=majority", { userNewUrlParser: true });
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 4000;
app.get('/work', (req, res) => {
  res.render('success')
})
app.get("/", (req, res) => {
  res.render('index');
  // res.sendFile(__dirname + "/index.html");
});

app.post("/pay", [parseUrl, parseJson], (req, res) => {
  var paymentDetails = {
    amount: '1000',
    customerId: req.body.name,
    customerPhone: req.body.mobile,
    customerEmail: req.body.email
  }
  let aadharNo = req.body.aadhar
  let bikeAlong = req.body.bike
  let rcNo = req.body.bikeNumber
  let fbLink = req.body.fb
  let instaLink = req.body.insta
  let ytLink = req.body.youtube
  let vP = req.body.vlog
  let bikeRide = req.body.groups
  let bikeMean = req.body.mean
  let bg = req.body.experience
  let rideGrp = req.body.group
  let kms = req.body.km
  let kmsTride = req.body.km1
  let abtK2K = req.body.about
  let early = req.body.bike_2
  let hour = req.body.hour
  let pref1 = req.body.ride
  let pref2 = req.body.planning
  let pref3 = req.body.activity
  let pref4 = req.body.day
  let source = req.body.know
  let inj = req.body.injured
  let rideM = req.body.riding

  let selected_states = []
  if (req.body.jammukashmir) {
    selected_states.push("jammuandkashmir")
  }
  if (req.body.panjab) {
    selected_states.push("punjab")
  }
  if (req.body.rajastan) {
    selected_states.push("rajastan")
  }
  if (req.body.gujarat) {
    selected_states.push("gujarat")
  }
  if (req.body.maharashtra) {
    selected_states.push("maharashtra")
  }
  if (req.body.goa) {
    selected_states.push("goa")
  }
  if (req.body.karnakata) {
    selected_states.push("karnataka")
  }
  if (req.body.kerala) {
    selected_states.push("kerala")
  }
  if (req.body.tamilnadu) {
    selected_states.push("tamilnadu")
  }


  let orderId = 'HPK2K_' + new Date().getTime();

  let ins = new profile({
    'name': paymentDetails.customerId, 'mobile': paymentDetails.customerPhone, 'email': paymentDetails.customerEmail, 'aadharNo': aadharNo, 'bikeAlong': bikeAlong, 'rcNo': rcNo,
    'fbLink': fbLink, 'instaLink': instaLink, 'ytLink': ytLink, 'vP': vP, 'bikeRide': bikeRide, 'bikeMean': bikeMean,
    'bg': bg, 'rideGrp': rideGrp, 'kms': kms, 'kmsTride': kmsTride, 'abtK2K': abtK2K, 'pref1': pref1, 'pref2': pref2, 'pref3': pref3,
    'pref4': pref4, 'source': source, 'inj': inj, 'rideM': rideM, 'orderId': orderId, 'early': early, 'hour': hour, Selected_states: selected_states
  })
  console.log(ins);
  ins.save((err) => {
    if (err) {
      throw err
    }
    else {
      if (!paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
        res.status(400).send('Payment failed')
      } else {
        var params = {};
        params['MID'] = config.PaytmConfig.mid;
        params['WEBSITE'] = config.PaytmConfig.website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = orderId;
        params['CUST_ID'] = paymentDetails.customerId;
        params['TXN_AMOUNT'] = '1000';
        params['CALLBACK_URL'] = 'https://registration.hashtagplanners.in/callback';
        params['EMAIL'] = paymentDetails.customerEmail;
        params['MOBILE_NO'] = paymentDetails.customerPhone;

        checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
          // var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
          var txn_url = "https://securegw.paytm.in/order/process"; // for production

          var form_fields = "";
          for (var x in params) {
            form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
          }
          form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
          res.end();
        });
      }
    }
  })
});
app.post('/feedback', (req, res) => {

  controller.feedback(req, res);

})
app.post("/callback", (req, res) => {
  // Route for verifiying payment

  var body = '';

  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    var html = "";
    var post_data = qs.parse(body);

    // received params in callback
    console.log('Callback Response: ', post_data, "\n");


    // verify the checksum
    var checksumhash = post_data.CHECKSUMHASH;
    // delete post_data.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
    console.log("Checksum Result => ", result, "\n");


    // Send Server-to-Server request to verify Order Status
    var params = { "MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID };

    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

      params.CHECKSUMHASH = checksum;
      post_data = 'JsonData=' + JSON.stringify(params);

      var options = {
        //  hostname: 'securegw-stage.paytm.in', // for staging
        hostname: 'securegw.paytm.in', // for production
        port: 443,
        path: '/merchant-status/getTxnStatus',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
        }
      };


      // Set up the request
      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on('data', function (chunk) {
          response += chunk;
        });

        post_res.on('end', function () {
          console.log('S2S Response: ', response, "\n");

          var _result = JSON.parse(response);
          console.log(_result)
          if (_result.STATUS == 'TXN_SUCCESS') {
            profile.updateOne({ 'orderId': _result.ORDERID }, { 'Status': _result.STATUS, 'TXNDATE': _result.TXNDATE, 'TXNID': _result.TXIND, 'BankTxn': _result.BANKTXNID }, (err, data) => {
              if (err) {
                throw err
              }
              else {
                res.render('success')
              }
            })

          } else {
            profile.updateOne({ 'orderId': _result.ORDERID }, { 'Status': _result.STATUS, 'TXNDATE': _result.TXNDATE, 'TXNID': _result.TXIND, 'BankTxn': _result.BANKTXNID }, (err, data) => {
              if (err) {
                throw err
              }
              else {
                res.render('failed')
              }
            })
          }
        });
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
