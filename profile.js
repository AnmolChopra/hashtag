let mongoose = require('mongoose');

module.exports = mongoose.model('profile', {
    name: {
        type: String
    },
    mobile: {
        type: String
    },
    email: {
        type: String
    },
    aadharNo: {
        type: String
    },
    bikeAlong: {
        type: String
    },
    rcNo: {
        type: String
    },
    early: {
        type: String
    },
    hour: {
        type: String
    },
    fbLink: {
        type: String
    },
    instaLink: {
        type: String
    },
    ytLink: {
        type: String
    },
    vP: {
        type: String
    },
    bikeRide: {
        type: String
    },
    bikeMean: {
        type: String
    },
    bg: {
        type: String
    },
    rideGrp: {
        type: String
    },
    kms: {
        type: String
    },
    kmsTride: {
        type: String
    },
    abtK2K: {
        type: String
    },
    pref1: {
        type: String
    },
    pref2: {
        type: String
    },
    pref3: {
        type: String
    },
    pref4: {
        type: String
    },
    source: {
        type: String
    },
    inj: {
        type: String
    },
    rideM: {
        type: String
    },
    orderId: {
        type: String
    },
    txnId: {
        type: String
    },
    Status: {
        type: String
    },
    TXNDATE: {
        type: String
    },
    TXNID: {
        type: String
    },
    BankTxn: {
        type: String
    },
    regiDt: {
        type: Date,
        'Default': Date.now()
    },
    Selected_states: {
        type: []
    }
})