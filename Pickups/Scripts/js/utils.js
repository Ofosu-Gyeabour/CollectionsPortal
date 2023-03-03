var utils = $(function () {
    var appName = "Mortgage Application System";

    var loan = 0.00;
    var rate = 0.00;
    var term = 0.00;
    var fstPayDate = "";
    var cmpPeriod = "";
    var payFreq = "";
    var homeVal = 0.00;
    var propTax = 0.00;
    var yrInsurance = 0.00;
    var monthlyPMI = 0.00;
    var compPay = 0.00;
    var periods_per_yr = 12;

    return {
        test: function () { console.log('testing'); },
        getAppName: function () {
            return appName;
        },

        setLoanAmount: function (str) {
            loan = str;
        },
        setAnnualInterestRate: function (rte) {
            rate = rte;
        },
        setTermLength: function (trm) {
            term = trm;
        },
        setFirstPayDate: function (fpdte) {
            fstPayDate = fpdte;
        },
        setCompoundPeriod: function (cmp) {
            cmpPeriod = cmp;
        },
        setPaymentFreq: function (pfreq) {
            payFreq = pfreq;
        },
        setPropertyTax: function (tx) {
            propTax = tx;
        },
        getPropertyTax: function () {
            return propTax;
        },
        setYearInsurance: function (yins) {
            yrInsurance = yins;
        },
        getYearInsurance: function () {
            return (yrInsurance);
        },
        setMonthlyPMI: function (mpmi) {
            monthlyPMI = mpmi;
        },
        getBiWeekly: function () {
            return compPay;
        },
        computeBiWeekly: function () {
            var compRate = ((rate / 100) / 12);
            var powRate = Math.pow((1 + compRate), (term * 12));
            var divisor = (powRate - 1);

            switch (payFreq) {
                case "Acc Bi-Weekly":
                    compPay = (Math.round(((loan * powRate) * compRate) / (divisor) * 100) / 100);
                    break;
                case "Monthly":
                    compPay = (Math.round(((loan * powRate) * compRate) / (divisor) * 100) / 100);
                    break;
                case "Semi-Monthly":
                    compPay = (Math.round(((loan * powRate) * compRate) / (divisor) * 100) / 100);
                    break;
                case "Bi-Weekly":
                    compPay = (Math.round(((loan * powRate) * compRate) / (divisor) * 100) / 100);
                    break;
                case "Weekly":
                    compPay = (Math.round(((loan * powRate) * compRate) / (divisor) * 100) / 100);
                    break;
                case "Acc Weekly":
                    compPay = (Math.round(((loan * powRate) * compRate) / (divisor) * 100) / 100);
                    break;

                    alert(compPay);
            }
        },
        returnPITIPayment: function (param) {
            alert(param); return false;
            propTax = Math.round((param * (1.8 / 100)));
            yrInsurance = (param * (0.4 / 100));
        },
        computePITI: function (mPMI) {
            return (compPay + propTax / periods_per_yr + yrInsurance / periods_per_yr + mPMI * 12 / periods_per_yr);
        }

    }

})();