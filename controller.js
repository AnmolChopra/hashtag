let profile = require('./profile');

const checksum_lib = require("./Paytm/checksum");
const config = require("./Paytm/config");

let mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/hashtag",{userNewUrlParser: true});

module.exports={
    regi:function( req,res){
        var paymentDetails = {
            amount: '1000',
            customerId : req.body.customerId,
            customerPhone : req.body.mobile,
            customerEmail : req.body.email   
        }
        let aadharNo = req.body.aadhar
        let bikeAlong = req.body.bike
        let rcNo =req.body.bikeNumber
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
        let orderId ='HPK2K_'  + new Date().getTime();

        let ins = new profile({'name':paymentDetails.customerId,'mobile':paymentDetails.customerPhone,'email':paymentDetails.customerEmail,'aadharNo':aadharNo,'bikeAlong':bikeAlong,'rcNo':rcNo,
                                'fbLink':fbLink,'instaLink':instaLink,'ytLink':ytLink,'vP':vP,'bikeRide':bikeRide,'bikeMean':bikeMean,
                            'bg':bg,'rideGrp':rideGrp,'kms':kms,'kmsTride':kmsTride,'abtK2K':abtK2K,'pref1':pref1,'pref2':pref2,'pref3':pref3,
                            'pref4':pref4,'source':source,'inj':inj,'rideM':rideM,'orderId':orderId,'early':early,'hour':hour})
        ins.save((err)=>{
            if(err){
                throw err
            }
            else{
                if( !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
                    res.status(400).send('Payment failed')
                } else {
                    var params = {};
                    params['MID'] = config.PaytmConfig.mid;
                    params['WEBSITE'] = config.PaytmConfig.website;
                    params['CHANNEL_ID'] = 'WEB';
                    params['INDUSTRY_TYPE_ID'] = 'Retail';
                    params['ORDER_ID'] = orderId;
                    params['CUST_ID'] = paymentDetails.customerId;
                    params['TXN_AMOUNT'] = '1';
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
    },
    callback:function(req,res){
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
     var params = {"MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID};

     checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

       params.CHECKSUMHASH = checksum;
       post_data = 'JsonData='+JSON.stringify(params);

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
       var post_req = https.request(options, function(post_res) {
         post_res.on('data', function (chunk) {
           response += chunk;
         });

         post_res.on('end', function(){
           console.log('S2S Response: ', response, "\n");

           var _result = JSON.parse(response);
           console.log(_result)
             if(_result.STATUS == 'TXN_SUCCESS') {
                 profile.updateOne({'orderId':_result.ORDERID},{'Status':_result.STATUS,'TXNDATE':_result.TXNDATE,'TXNID':_result.TXIND,'BankTxn':_result.BANKTXNID},(err,data)=>{
                     if(err) {
                         throw err
                     }
                     else{
                        res.send('PAYMENT SUCCESSFUL')
                     }
                 })

             }else {
                 profile.updateOne({'orderId':_result.ORDERID},{'Status':_result.STATUS,'TXNDATE':_result.TXNDATE,'TXNID':_result.TXIND,'BankTxn':_result.BANKTXNID},(err,data)=>{
                     if(err) {
                         throw err
                     }
                     else{
                        res.send('Payment Failed') 
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
    }
}
