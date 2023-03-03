var myApp = { }

    myApp.usrName = "";
    myApp.userInfo = [],
    myApp.recoveryOfficers = "",
    myApp.departments = "",
    myApp.loginValue = "",
    myApp.staffRecord = "",
    myApp.departmentPosn = "",                  //array that holds all departments and positions in the system
    myApp.assignedCases = "";
    myApp.allCases = "";
    myApp.modules = "";                         //an array holding all the modules that can be found in the system
    myApp.userModules = "";                     //an array depicting all the modules a user is using
    myApp.userModuleIDs = "";
    myApp.def_values = "";                      //default client values
    myApp.positions = "";

    myApp.tempField = [];

    myApp.setValue = function (_val) {
        this.loginValue = _val;
    }

    myApp.setUsername = function (_value) {
        myApp.usrName = _value;
    }
    
    myApp.getUsername = function () {
        return (myApp.usrName);
    }

    myApp.getValue = function () {
        return (this.loginValue);
    }

    myApp.logIn = function (usr, pass) {
        $.post('/Home/Authenticate'
            , { usrname: usr, pwd: pass }
            , function (resp) {
                return (resp.toString());
            });
    }

    

    myApp.getRecoveryOfficers = function () {
        $.getJSON('/Home/LoadRecoveryOfficers', {}, function (data) {
            var arr = [];
            $.each(data, function (i, val) {
                arr.push(val);                
            });
            myApp.setRecoveryOfficers(arr);
        });
    }

    myApp.setRecoveryOfficers = function (data) {
        this.recoveryOfficers = data;
    }

    myApp.loadRecoveryOfficers = function () {
        return (this.recoveryOfficers);
    }

    myApp.setDepartmentData = function (data) {
        this.departments = data;
    }

    myApp.fetchDepartments = function () {
        //fetches the departments in the datastore. supposed to be done once in the lifetime of an application session
        $.getJSON('/Utility/LoadDepartmentData', {}, function (data) {
            var dept = [];
            $.each(data, function (i, val) {
                dept.push(val);
            });
            myApp.setDepartmentData(dept);
        });
    }

    myApp.getDepartmentData = function () {
        return (this.departments);
    }

    myApp.updateDepartmentInfo = function (depValue) {
        //uses the argument to update the department array
        this.departments.push(depValue);
    }

    myApp.loadStaffInformation = function () {
        //loads all staff information
        var staff = [];
        $.getJSON('/Utility/LoadStaffInformation', {}, function (data) {
            myApp.staffRecord = data;
        });
    }

    myApp.loadDepartmentPositions = function () {
        //loads the positions in all the departments
        $.getJSON('/Utility/GetDepartmentPositions', {}, function (data) {
            myApp.departmentPosn = data;
        });
    }

    myApp.filterDepartmentPositions = function (param) {
        //filters and returns right department positions
        var filteredDept = [];
        
        $.each(myApp.departmentPosn, function (idx, val) {

            if (val.toString() == param) {
                filteredDept.push(idx.toString());
            }
        });
        
        return (filteredDept);
    }

    myApp.getPositions = function () {
        var arry = [];
        $.each(myApp.departmentPosn, function (i, val) {
            arry.push(i.toString());
        });

        myApp.positions = arry;
        return (myApp.positions);
    }

    myApp.selectStaffInformation = function (param) {
        //uses the parameter to fetch records
        var selected_staff = [];
        $.each(myApp.staffRecord, function (idx, val) {
            if (val.toString() == param) {
                selected_staff.push(idx);
            }
        });

        return (selected_staff);
    }

    myApp.LoadAssignedCases = function () {
        var cases = [];
        $.getJSON('/Utility/GetAssignedCases', {}, function (data) {
            $.each(data, function (idx, val) {
                cases.push(val.toString());
            });

            myApp.assignedCases = cases;
        });
    }

    myApp.getAssignedCases = function () {
        return (myApp.assignedCases);
    }

    myApp.LoadAllCases = function () {
        var _allcases = [];
        $.getJSON('/Utility/GetAllCases', {}, function (data) {
            $.each(data, function (idx, val) {
                _allcases.push(val.toString());
            });

            myApp.allCases = _allcases;
        });
    }
    myApp.getAllCases = function () {
        return (myApp.allCases);
    }

    myApp.getModules = function () {
        var usr = [];
        var usrIDs = [];
        $.get('/Utility/GetUserModules', {}, function (data) {
            $.each(data, function (idx, val) {
                usrIDs.push(val["ModuleID"]);
                usr.push(val["FriendlyName"]);
            });
            myApp.modules = usr;
            myApp.userModuleIDs = usrIDs;
        });
    }
    
    myApp.returnUserModules = function () {
        return (myApp.userModules);
    }

    myApp.loadDefaultClientValues = function () {
        $.getJSON('/Utility/GetDefaultClientValues',
        {}, function (dta_rec) {
            myApp.def_values = dta_rec;
        });
    }

    myApp.getDefaultClientValues = function () {
        return (myApp.def_values);
    }

    myApp.SearchForCases = function (rofficer, cName, dtF, dtT) {
        $.getJSON('/Utility/SearchForCases',
        { officer: rofficer, caseName: cName, dateFrom: dtF, dateTo: dtT },
        function (dta) {
            //$.each(dta, function (i, val) {
            //myApp.tempField.push(val.CaseName.toString());
            //});   
            myApp.tempField = dta;
        });
    }
    myApp.returnSearchedCases = function () {
        return (myApp.tempField);
    }

    myApp.SearchForCasesWithParams = function (rofficer, cName, dtF, dtT) {
        $.getJSON('/Utility/SearchForCasesWithParams',
        { officer: rofficer, caseName: cName, dateFrom: dtF, dateTo: dtT },
        function (dta) {   
            myApp.tempField = dta;
        });
    }
    myApp.GetMonthlyReports = function ($case_name) {
        $.getJSON('/Utility/GetMonthlyReport',
        { nameOfcase: $case_name },
        function (_data) {
            myApp.tempField = _data;
        });
    }
    myApp.ReturnReportData = function () {
        return (myApp.tempField);
    }

    myApp.uneditable = function (ctrls) {
        $.each(ctrls, function (val) {
            $(this).attr('readonly', true);
        });
    };