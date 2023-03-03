Ext.onReady(function () {

    Ext.QuickTips.init();

    var msg = function(title, msg){
        Ext.Msg.show({
            title: title,
            msg: msg,
            minWidth: 200,
            modal: true,
            icon: Ext.Msg.INFO,
            buttons: Ext.Msg.OK
        });
    };

    var fibasic = new Ext.ux.form.FileUploadField({
        renderTo: 'fi-basic',
        width: 400
    });

    new Ext.Button({
        text: 'Get File Path',
        renderTo: 'fi-basic-btn',
        handler: function(){
            var v = fibasic.getValue();
            msg('Selected File', v && v != '' ? v : 'None');
        }
    });

    var fbutton = new Ext.ux.form.FileUploadField({
        renderTo: 'fi-button',
        buttonOnly: true,
        listeners: {
            'fileselected': function(fb, v){
                var el = Ext.fly('fi-button-msg');
                el.update('<b>Selected:</b> '+v);
                if(!el.isVisible()){
                    el.slideIn('t', {
                        duration: .2,
                        easing: 'easeIn',
                        callback: function(){
                            el.highlight();
                        }
                    });
                }else{
                    el.highlight();
                }
            }
        }
    });

    var fp = new Ext.FormPanel({
        renderTo: 'fi-form',
        fileUpload: true,
        width: 500,
        frame: true,
        title: 'File Upload Form',
        autoHeight: true,
        bodyStyle: 'padding: 10px 10px 0 10px;',
        labelWidth: 50,
        defaults: {
            anchor: '95%',
            allowBlank: false,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Name'
        },{
            xtype: 'fileuploadfield',
            id: 'form-file',
            emptyText: 'Select an image',
            fieldLabel: 'Photo',
            name: 'photo-path',
            buttonText: '',
            buttonCfg: {
                iconCls: 'upload-icon'
            }
        }],
        buttons: [{
            text: 'Save',
            handler: function(){
                if(fp.getForm().isValid()){
                    fp.getForm().submit({
                        url: 'file-upload.php',
                        waitMsg: 'Uploading your photo...',
                        success: function(fp, o){
                            msg('Success', 'Processed file "'+o.result.file+'" on the server');
                        }
                    });
                }
            }
        },{
            text: 'Reset',
            handler: function(){
                fp.getForm().reset();
            }
        }]
    });



    Ext.get('stenrollment').on('click', function (e, t) {
    
        Ext.onReady(function () {
           var rptdata = null;
           var rptmode = null;
           var _lnId = null;
           var _clId = null;
           var def_pic = "http://192.168.5.11:82/images/standard.jpg";
           var tpsite = "http://192.168.5.11:82/images/temp/pic/";
           var tnsite = "http://192.168.5.11:82/images/temp/ids/";
           var pic = "http://192.168.5.11:82/images/live/pic/";
           var nat = "http://192.168.5.11:82/images/live/ids/";

           //upload form
           myuploadform = new Ext.FormPanel({
               id: 'myuploadform',
               fileUpload: true,
               width: 300,
               autoHeight: true,
               bodyStyle: 'padding: 10px 10px 10px 10px;',
               labelWidth: 50,
               defaults: { allowBlank: false, msgTarget: 'side' }, layout: 'column', width: '50%',
               items: [
                    {
                        xtype: 'panel', title: 'Photograph', frame: true,
                        items: [
                            {
                                tpl: new Ext.XTemplate(
                                    '<input type="file" id="filedata" name="{filename}">',
                                        '<br><br><br>',
                                        '<div style="border:1px solid blue;max-width:230px;max-height:100%;">',
                                        '<img id="im" style="width:200px;height:220px;" src="{urlpath}" alt="{alternative}">',
                                    '</div>'
                                ),
                                id: 'xtx', compiled: true, data: { filename: 'filedata', alternative: 'preview image', urlpath: def_pic }, autoScroll: true
                            },
                            {
                                xtype: 'panel', layout: 'column', columnWidth: .3,
                                items: [
                                    {
                                        xtype: 'button', id: 'bt', text: 'Upload Photograph',
                                        handler: function () {
                                            if (Ext.get('jntClId').getValue().length > 0) {

                                                if (myuploadform.getForm().isValid()) {
                                                    form_action = 1;
                                                    //Ext.getCmp('myuploadform').el.mask('Please wait', 'x-mask-loanding');
                                                    myuploadform.getForm().submit({
                                                        url: '/Mortgage/UploadToTemp',
                                                        params: { cId: Ext.fly('jntClId').getValue() },
                                                        //reset: true,
                                                        standardSubmit: true
                                                    });
                                                }
                                            }
                                            else { Ext.Msg.alert('GENERATE CLIENT ID', 'Please generate a client Id for the application to upload', this); }
                                        } //end of handler
                                    },
                                    {
                                        xtype: 'button', id: 'btnPrev', text: 'Preview',
                                        handler: function () {
                                            Ext.getCmp('xtx').update({ urlpath: tpsite + Ext.fly('jntClId').getValue() + '.jpg' });
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'panel', title: 'National ID', frame: true,
                        items: [
                            {
                                tpl: new Ext.XTemplate(
                                    '<input type="file" id="natfile" name="{filename}">',
                                    '<br><br><br>',
                                    '<div style="border:1px solid blue;max-width:230px;max-height:100%;">',
                                    '<img id="natim" style="width:200px;height:220px;" src="{urlpath}" alt="{alternative}">',
                                    '</div>'
                                ),
                                id: 'natID', compiled: true, data: { filename: 'natfile', alternative: 'preview image', urlpath: def_pic }, autoScroll: true
                            },
                            {
                                xtype: 'panel', layout: 'column', columnWidth: .3,
                                items: [
                                    {
                                        xtype: 'button', id: 'bt', text: 'Upload National ID',
                                        handler: function () {
                                            if (Ext.get('jntClId').getValue().length > 0) {

                                                if (myuploadform.getForm().isValid()) {
                                                    form_action = 1;
                                                    //Ext.getCmp('myuploadform').el.mask('Please wait', 'x-mask-loanding');
                                                    myuploadform.getForm().submit({
                                                        url: '/Mortgage/UploadNatIDToTemp',
                                                        params: { cId: Ext.fly('jntClId').getValue() },
                                                        reset: true,
                                                        standardSubmit: true
                                                    });
                                                }
                                            }
                                            else { Ext.Msg.alert('GENERATE CLIENT ID', 'Please generate a client Id for the application to upload', this); }
                                        } //end of handler
                                    },
                                    {
                                        xtype: 'button', id: 'btnPrev', text: 'Preview ID',
                                        handler: function () {
                                            Ext.getCmp('natID').update({ urlpath: tpsite + "n" + Ext.fly('jntClId').getValue() + '.jpg' });
                                        }
                                    }
                                ]
                            }
                        ]
                    }
               ]
           });

           var sx = function () {
               Ext.getCmp('myuploadform').el.unmask();
               Ext.getCmp('xtx').update({ urlpath: site + Ext.fly('jntClId').getValue() + '.jpg' });
           }
           var jntApp = new Ext.form.FormPanel({
               id: 'jntApp',
               width: 'auto',
               height: 'auto',
               layout: 'column',
               defaults: { frame: true },
               items: [
                        {
                            xtype: 'form',
                            id: 'frmBorrower',
                            columnWidth: .5,
                            //title: 'Asset Finance Application',
                            width: 'auto',
                            layout: 'form',
                            defaultType: 'field',
                            defaults: { anchor: '70%', allowBlank: false },
                            autoScroll: true,
                            items: [
                                {
                                    xtype: 'form',
                                    id: 'frmgenId',
                                    title: 'Generate Client ID',
                                    defaultType: 'combo',
                                    frame: true,
                                    items: [
                                        {
                                            xtype: 'form',
                                            id: 'frmAppID',
                                            layout: 'column',
                                            defaultType: 'combo',
                                            defaults: { allowBlank: false },
                                            labelAlign: 'left',
                                            autoScroll: true,
                                            items: [
                                                {
                                                    xtype: 'numberfield',
                                                    id: 'jntClId',
                                                    fieldLabel: 'Client ID',
                                                    columnWidth: .6
                                                },
                                                {
                                                    xtype: 'button',
                                                    text: 'Add',
                                                    id: 'jntCAdd',
                                                    columnWidth: .3,
                                                    listeners: {
                                                        'click': function (btn) {
                                                            $.post('/Mortgage/CreateApplication', {},
                                                                function (resp) {
                                                                    $('#jntClId').empty().val(resp.toString());
                                                                    $('#jntClId').attr('readonly', true);
                                                                }, "json");
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    xtype: 'form',
                                    title: 'Personal Data',
                                    width: 600,
                                    defaults: { anchor: '95%' },
                                    defaultType: 'field',
                                    frame: true,
                                    items: [
                                        {
                                            id: 'jntFLastName',
                                            fieldLabel: 'Last Name'
                                        },
                                        {
                                            id: 'jntFstName',
                                            fieldLabel: 'First Name'
                                        },
                                        {
                                            id: 'jntFMdName',
                                            fieldLabel: 'Middle Name',
                                            allowBlank: true
                                        }
                                    ]
                                },
                                {
                                    xtype: 'form',
                                    title: 'Identification Particulars',
                                    width: 600,
                                    frame: true,
                                    defaults: { allowBlank: false, anchor: '99%' },
                                    defaultType: 'textfield',
                                    items: [
                                        {
                                            xtype: 'combo',
                                            id: 'jntIdType',
                                            fieldLabel: 'Identification',
                                            forceSelection: true,
                                            emptyText: 'Select Identification Type',
                                            typeAhead: true,
                                            mode: 'local',
                                            store: ['Voters', 'Passport', 'Health Insurance', 'Drivers License', 'National ID']
                                        },
                                        {
                                            xtype: 'textfield',
                                            id: 'jntIdNo',
                                            fieldLabel: 'Id Number'
                                        },
                                        {
                                            id: 'jntFcell',
                                            fieldLabel: 'Cell Phone'
                                        },
                                        {
                                            id: 'jntFTellNo',
                                            fieldLabel: 'Telephone No'
                                        },
                                        {
                                            id: 'jntFEmail',
                                            fieldLabel: 'Email'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'form',
                                    title: 'Addresses',
                                    width: 600,
                                    defaultType: 'textarea',
                                    defaults: { anchor: '99%' },
                                    frame: true,
                                    items: [
                                        {
                                            id: 'jntFRes',
                                            fieldLabel: 'Residential Address'
                                        },
                                        {
                                            id: 'jntFPAddr',
                                            fieldLabel: 'Previous Address',
                                            allowBlank: true
                                        }
                                    ]
                                },
                                {
                                    xtype: 'panel', layout: 'column',
                                    items: [
                                        {
                                            xtype: 'button', id: 'jntAppSave', text: 'Save Application', columnWidth: .6,
                                            handler: function (btn) {
                                                var thisF = Ext.getCmp('jntApp').getForm();
                                                if (thisF.isValid()) {
                                                    thisF.submit({
                                                        clientValidation: true,
                                                        method: 'POST',
                                                        reset: true,
                                                        url: '/Mortgage/SaveApplication',
                                                        params: {
                                                            clId: Ext.fly('jntClId').getValue(), ln: Ext.fly('jntFLastName').getValue(), mn: Ext.fly('jntFMdName').getValue(),
                                                            fn: Ext.fly('jntFstName').getValue(), idt: Ext.fly('jntIdType').getValue(), idn: Ext.fly('jntIdNo').getValue(),
                                                            cel: Ext.fly('jntFcell').getValue(), tel: Ext.fly('jntFTellNo').getValue(), em: Ext.fly('jntFEmail').getValue(),
                                                            rAdr: Ext.fly('jntFRes').getValue(), prevAdr: Ext.fly('jntFPAddr').getValue()
                                                        },
                                                        sucess: function (action, response) {
                                                            Ext.getCmp('jntApp').getForm().reset();
                                                            $('#jntAppClear').trigger('click');
                                                        },
                                                        error: function (errmsg) {
                                                            Ext.Msg.alert('ERROR', 'An error occured.Please contact administrator', this);
                                                        },
                                                        waitTitle: 'Processing',
                                                        waitMsg: 'Processing data. Please wait'
                                                    });

                                                } else { Ext.Msg.alert('ASSET FINANCE 1.0.0', 'Please enter all required fields', this); }
                                            }
                                        },
                                        {
                                            xtype: 'button', id: 'jntAppClear', text: 'Clear Application Form', columnWidth: .4,
                                            handler: function (btn) {
                                                Ext.getCmp('jntApp').getForm().reset();
                                                Ext.getCmp('natID').update({ urlpath: def_pic });
                                                Ext.getCmp('xtx').update({ urlpath: def_pic });
                                            }
                                        }
                                    ]
                                }
                            ]
                        }, //end of application form
                        {
                        xtype: 'panel', title: 'Scanned Supporting Documents', columnWidth: .5, defaults: { xtype: 'fileuploadfield' }, layout: 'form',
                        items: [
                             myuploadform
                        ]
                    }
                    ]
           });

           var curEmp = new Ext.form.FormPanel({
               id: 'curEmp',
               title: 'Current Employment',
               frame: true,
               border: true,
               defaults: {},
               defaultType: 'field',
               layout: 'column',
               items: [
                    {
                        xtype: 'form',
                        id: 'curEmpBoro',
                        title: 'Current Employment',
                        layout: 'form',
                        defaultType: 'field',
                        width: '50%',
                        defaults: { anchor: '90%', allowBlank: false, width: '90%' },
                        frame: true,
                        border: true,
                        items: [
                            {
                                id: 'cBoroSSN',
                                fieldLabel: 'SSN'
                            },
                            {
                                id: 'cBoroOcc',
                                fieldLabel: 'Occupation'
                            },
                            {
                                xtype: 'numberfield',
                                id: 'cBoroEmpL',
                                fieldLabel: 'Employment Length'
                            },
                            {
                                xtype: 'textarea',
                                id: 'cBoroAddr',
                                fieldLabel: 'Employer Address'
                            },
                            {
                                id: 'cBoroCEmp',
                                fieldLabel: 'Current Employer'
                            },
                            {
                                xtype: 'button',
                                id: 'cBoroSave',
                                text: 'Save Employment Data',
                                listeners: {
                                    'click': function () {
                                        var thisFrm = Ext.getCmp('curEmpBoro').getForm();
                                        if (thisFrm.isValid()) {
                                            if ($('#eClId').val().length > 0) {
                                                thisFrm.submit({
                                                    clientValidation: true,
                                                    method: 'POST',
                                                    url: '/Mortgage/SaveEmploymentData',
                                                    params: {
                                                        clId: Ext.fly('eClId').getValue(), ssn: Ext.fly('cBoroSSN').getValue(), occ: Ext.fly('cBoroOcc').getValue(), empLen: Ext.fly('cBoroEmpL').getValue(),
                                                        empAddr: Ext.fly('cBoroAddr').getValue(), currentEmp: Ext.fly('cBoroCEmp').getValue()
                                                    },
                                                    success: function () {
                                                        thisFrm.reset();
                                                        Ext.fly('cBoroSSN').focus();
                                                    },
                                                    error: function () { },
                                                    waitTitle: 'Processing...',
                                                    waitMsg: "Saving Borrower's current employment.Please wait"
                                                });
                                            }
                                            else { Ext.Msg.alert('Client ID', 'Please enter the ID of the Borrower'); Ext.fly('eClId').focus(); }
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'form', id: 'prevEmpBoro', title: 'Previous Employment', width: '50%', frame: true, defaultType: 'textfield', defaults: { allowBlank: false, width: '90%' },
                        items: [
                            {
                                id: 'pocc',
                                fieldLabel: 'Previous Occupation'
                            },
                            {
                                id: 'pemp',
                                fieldLabel: 'Previous Employer/Business'
                            },
                            {
                                id: 'ptel',
                                fieldLabel: 'Telephone'
                            },
                            {
                                id: 'pshrs',
                                fieldLabel: '% shares in business'
                            },
                            {
                                id: 'pbnature',
                                fieldLabel: 'Business Nature'
                            },
                            {
                                xtype: 'numberfield',
                                id: 'plenn',
                                fieldLabel: 'Prev. Emp. Length'
                            },
                            {
                                xtype: 'button',
                                id: 'pempBtn',
                                text: "Save Borrower's Record",
                                anchor: '100%',
                                listeners: {
                                    'click': function () {
                                        var thisF = Ext.getCmp('prevEmpBoro').getForm();
                                        if ($('#eClId').val().length > 0) {
                                            thisF.submit({
                                                clientValidation: true,
                                                method: 'POST',
                                                reset: true,
                                                url: '/Mortgage/SavePreviousEmployment',
                                                params: {
                                                    cId: Ext.fly('eClId').getValue(), pOcc: Ext.fly('pocc').getValue(), pEmp: Ext.fly('pemp').getValue(),
                                                    pTel: Ext.fly('ptel').getValue(), pShares: Ext.fly('pshrs').getValue(), pBNat: Ext.fly('pbnature').getValue(),
                                                    pEmpLen: Ext.fly('plenn').getValue()
                                                },
                                                success: function () {
                                                    thisF.reset();
                                                },
                                                error: function () { }
                                            });
                                        }
                                        else { Ext.Msg.alert('BORROWER ID', 'Please enter the Id of the Borrower'); Ext.fly('eClId').focus(); }
                                    }
                                }
                            }
                        ]
                    }
               ]
           });

           var selfEmp = new Ext.form.FormPanel({
               id: 'selfEmp',
               title: 'Self Employment and Financials',
               frame: true,
               border: true,
               defaults: {},
               defaultType: 'field',
               layout: 'column',
               items: [
                    {
                        xtype: 'form',
                        id: 'selfEmpBoro',
                        title: 'Self Employment',
                        defaultType: 'field',
                        columnWidth: .5,
                        frame: true,
                        border: true,
                        defaults: { allowBlank: false },
                        items: [
                            {
                                id: 'sEmpBiz',
                                fieldLabel: 'Business Nature'
                            },
                            {
                                id: 'sEmpBizL',
                                fieldLabel: 'Emp. Length'
                            },
                            {
                                id: 'sEmpBizTel',
                                fieldLabel: 'Bus. Tel No'
                            },
                            {
                                id: 'sEmpAddr',
                                fieldLabel: 'Addr(if self employed)'
                            },
                            {
                                id: 'sEmpPshares',
                                fieldLabel: '% shares in Business'
                            },
                            {
                                id: 'sEmpAccnt',
                                fieldLabel: 'Accountant(if self emp.)'
                            },
                            {
                                xtype: 'button',
                                id: 'selfEmpSave',
                                text: 'Save Record',
                                listeners: {
                                    'click': function () {
                                        var thisFrm = Ext.getCmp('selfEmpBoro').getForm();
                                        if ($('#eClId').val().length > 0) {
                                            thisFrm.submit({
                                                clientValidation: true,
                                                method: 'POST',
                                                reset: true,
                                                url: '/Mortgage/SaveSelfEmployment',
                                                params: {
                                                    cId: Ext.fly('eClId').getValue(), bnat: Ext.fly('sEmpBiz').getValue(), eLen: Ext.fly('sEmpBizL').getValue(), btel: Ext.fly('sEmpBizTel').getValue(),
                                                    selfAddr: Ext.fly('sEmpAddr').getValue(), shares: Ext.fly('sEmpPshares').getValue(), accntant: Ext.fly('sEmpAccnt').getValue(),
                                                    opType: 'o'
                                                },
                                                success: function () {
                                                    thisFrm.reset();
                                                    Ext.fly('sEmpBiz').focus();
                                                },
                                                error: function () { },
                                                waitTitle: 'Processing...',
                                                waitMsg: "Processing Borrower's self employment record"
                                            });
                                        }
                                        else { Ext.Msg.alert('BORROWER ID', 'Please enter the ID of the Borrower'); Ext.fly('eClId').focus(); }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'form',
                        id: 'selfEmpCoBoro',
                        title: 'Bank Details',
                        defaultType: 'field',
                        columnWidth: .5,
                        frame: true,
                        border: true,
                        items: [
                            {
                                id: 'bn',
                                fieldLabel: 'Name of Bank'
                            },
                            {
                                id: 'bnc',
                                fieldLabel: 'Name of Branch'
                            },
                            {
                                id: 'bntel',
                                fieldLabel: 'Telephone'
                            },
                            {
                                id: 'bncacc',
                                fieldLabel: 'Account No'
                            },
                            {
                                id: 'bncaccint',
                                fieldLabel: 'Acc Duration'
                            },
                            {
                                xtype: 'button',
                                id: 'bnkBoroSave',
                                text: 'Save Bank Details',
                                anchor: '90%',
                                listeners: {
                                    'click': function () {

                                        if ($('#eClId').val().length > 0) {
                                            var bnkF = Ext.getCmp('selfEmpCoBoro').getForm();
                                            if (bnkF.isValid()) {
                                                bnkF.submit({
                                                    clientValidation: true,
                                                    method: 'POST',
                                                    reset: true,
                                                    url: '/Mortgage/SaveBankDetails',
                                                    params: {
                                                        cId: Ext.fly('eClId').getValue(), bank: Ext.fly('bn').getValue(), branch: Ext.fly('bnc').getValue(),
                                                        tel: Ext.fly('bntel').getValue(), acc: Ext.fly('bncacc').getValue(), dur: Ext.fly('bncaccint').getValue()
                                                    },
                                                    success: function () {
                                                        bnkF.reset();
                                                    },
                                                    error: function () { },
                                                    waitTitle: 'Processing...',
                                                    waitMsg: 'Processing Bank Details. Please wait'
                                                });
                                            }
                                        }
                                        else { Ext.Msg.alert('BORROWER ID', 'Please enter the Id of the Borrower'); }
                                    }
                                }
                            }
                        ]
                    }
               ]
           });

           var empAccordion = new Ext.form.FormPanel({
               id: 'empAccordion',
               frame: true,
               border: true,
               height: 700,
               layout: 'accordion',
               defaultType: 'field',
               items: [
                    curEmp,
                    selfEmp
                ]
           });

           var calcSearch = new Ext.form.FormPanel({
               id: 'calcSearch',
               title: 'Client Search',
               layout: 'column',
               defaultType: 'field',
               frame: true,
               border: true,
               defaults: { allowBlank: false },
               items: [
                        {
                            xtype: 'form', id: 'asfcsearch',
                            items: [
                                {
                                    xtype: 'numberfield', id: 'cl_iD', fieldLabel: 'Client ID', emptyText: 'enter client Id',
                                    listeners: {
                                        'blur': function () {
                                            getRecord(this.getValue(), $('#mSn'), $('#mOn'));
                                        }
                                    }
                                },
                                { xtype: 'textfield', id: 'mSn', fieldLabel: 'Surname' },
                                { xtype: 'textfield', id: 'mOn', fieldLabel: 'Other names' },
                                {
                                    xtype: 'form',
                                    layout: 'column',
                                    defaultType: 'numberfield',
                                    items: [
                                        { id: 'cLnId', fieldLabel: 'Loan ID', columnWidth: .4 },
                                        {
                                            xtype: 'button', id: 'btnLIDAdd', text: 'Add Loan ID',
                                            handler: function () {
                                                $.getJSON('/Mortgage/CreateLoanID',
                                                    { clientId: Ext.fly('cl_iD').getValue() },
                                                    function (resp) {
                                                        $('#cLnId').val(resp.toString());
                                                    });
                                            }
                                        }
                                    ]
                                }
                            ],
                            columnWidth: .6
                        }
                    ]
           });


           var empCSearch = new Ext.form.FormPanel({
               id: 'empCSearch',
               title: 'Client Search',
               layout: 'column',
               defaultType: 'field',
               frame: true,
               border: true,
               defaults: { allowBlank: false },
               items: [
                        {
                            xtype: 'form',
                            items: [
                                {
                                    xtype: 'numberfield',
                                    id: 'eClId',
                                    fieldLabel: 'Client ID',
                                    listeners: {
                                        'blur': function () {
                                            getRecord(this.getValue(), $('#eBoro'), $('#eCoBoro'));
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    id: 'eBoro',
                                    fieldLabel: 'Surname'
                                },
                                {
                                    xtype: 'textfield',
                                    id: 'eCoBoro',
                                    fieldLabel: 'Other names'
                                }
                            ],
                            columnWidth: .6
                        }
                    ]
           });

           var empDataForm = new Ext.form.FormPanel({
               id: 'empDataForm',
               title: 'Employment Data',
               frame: true,
               border: true,
               defaultType: 'field',
               items: [
                    empCSearch,
                    empAccordion
               ]
           });

           var pScheduleStore = new Ext.data.Store({
               id: 'pScheduleStore',
               reader: new Ext.data.JsonReader({}, [
                    { name: 'No', type: 'int' },
                    { name: 'paymentDate', type: 'string' },
                    { name: 'annualInterestRate', type: 'float' },
                    { name: 'interestDue', type: 'float' },
                    { name: 'paymentDue', type: 'float' },
                    { name: 'principalPaid', type: 'float' },
                    { name: 'BalReturned', type: 'float' }
                ])
           });
           var pScheduleGrd = new Ext.grid.GridPanel({
               id: 'pScheduleGrd',
               store: pScheduleStore,
               colModel: new Ext.grid.ColumnModel({
                   defaults: {
                       width: 100,
                       sortable: true
                   }
               }),
               columns: [
                { header: 'No', id: 'no', width: 5, dataIndex: 'No', sortable: true, hidden: true },
                    { header: 'Payment Date', id: 'pay_date', width: 100, sortable: true, dataIndex: 'paymentDate' },
                    { header: 'Rate', id: 'int_rte', width: 60, dataIndex: 'annualInterestRate' },
                    { header: 'Interest Due', id: 'int_due', width: 100, dataIndex: 'interestDue' },
                    { header: 'Payment Due', id: 'py_due', width: 100, dataIndex: 'paymentDue' },
                    { header: 'Principal Paid', id: 'princ_py', width: 100, dataIndex: 'principalPaid' },
                    { header: 'Balance', id: 'bal_tx', width: 100, dataIndex: 'BalReturned' }
            ],
               viewConfig: {
                   forceFit: true
               },
               stripeRows: true,
               height: 250,
               width: '90%'
           });

           var CallRptStore = new Ext.data.Store({
               id: 'CallRptStore',
               reader: new Ext.data.JsonReader({}, [
                    { name: 'clientId', type: 'int' },
                    { name: 'clientName', type: 'string' },
                    { name: 'loanId', type: 'int' }
                ])
           });

           var CallRptGrd = new Ext.grid.GridPanel({
               id: 'CallRptGrd',
               store: CallRptStore,
               colModel: new Ext.grid.ColumnModel({
                   defaults: {
                       width: 100,
                       sortable: true
                   }
               }),
               columns: [
                    { header: 'Client ID', id: 'clientId', width: 100, sortable: true, dataIndex: 'clientId' },
                    { header: 'Client Name', id: 'clientName', width: 60, dataIndex: 'clientName' },
                    { header: 'Loan ID', id: 'loanId', width: 100, dataIndex: 'loanId' }
                ],
               viewConfig: {
                   forceFit: true
               },
               stripeRows: true,
               height: 200,
               width: '100%',
               listeners: {
                   rowclick: function (grid, rowIndex, e) {
                       record = grid.getStore().getAt(rowIndex);
                       _clId = record.get('clientId');
                       _lnId = record.get('loanId');
                       $.getJSON("/Utility/getRequestedLoanAmt", { cId: record.get('clientId'), lId: record.get('loanId') }, function (amt) {
                           $('#recAmt').val(amt.toString());
                       });
                       Ext.getCmp('mainPic').update({ path: pic + record.get('clientId') + '.jpg' });
                       getCallRpt(record.get('clientId'), record.get('loanId'), rptdata);
                   }
               }
           });


           //Calculator Form
           var calcForm = new Ext.form.FormPanel({
               id: 'calcForm',
               title: 'Asset Finance Calculator',
               height: 400, width: '100%',
               autoScroll: true,
               items: [
                    calcSearch,
                    {
                        xtype: 'form',
                        id: '',
                        width: '100%',
                        layout: 'column',
                        autoScroll: true,
                        items: [
                            {
                                width: '30%',
                                items: [
                                    {
                                        xtype: 'form',
                                        id: 'frmCalculator',
                                        defaultType: 'numberfield', frame: true, border: true, title: 'Calculator',
                                        defaults: { anchor: '90%' }, height: '100%', autoScroll: true, defaultType: 'numberfield',
                                        items: [
                                            {
                                                id: 'mLoanAmt', fieldLabel: 'Loan Amount',
                                                listeners: {
                                                    'blur': function () { computeBiWkly(); $('#btnGen').trigger('click'); }
                                                }
                                            },
                                            {
                                                id: 'mAnnIntRate', fieldLabel: 'Ann Interest Rate(%)',
                                                listeners: {
                                                    'blur': function () {
                                                        computeBiWkly();
                                                        $('#btnGen').trigger('click');
                                                    }
                                                }
                                            },
                                            {
                                                id: 'mterm', fieldLabel: 'Term(Months)',
                                                listeners: {
                                                    'blur': function () { $('#btnGen').trigger('click'); }
                                                }
                                            },
                                            {
                                                xtype: 'datefield', id: 'mfpaydate', fieldLabel: '1st Payment Date', format: 'd-m-Y', width: '55%',
                                                listeners: {
                                                    'blur': function () { $('#btnGen').trigger('click'); }
                                                }
                                            },
                                            {
                                                xtype: 'combo', id: 'mcompPeriod', fieldLabel: 'Comp. Period', forceSelection: true, typeAhead: true, mode: 'local', store: ['Monthly'], width: '55%',
                                                listeners: {
                                                    'select': function () { $('#btnGen').trigger('click'); }
                                                }
                                            },
                                            {
                                                xtype: 'combo', id: 'mpayFreq', fieldLabel: 'Pay Frequency', forceSelection: true, typeAhead: true, mode: 'local', store: ['Monthly'], width: '55%',
                                                listeners: {
                                                    'select': function () {
                                                        $('#btnGen').trigger('click');
                                                    }
                                                }
                                            },
                                            { id: 'mbipayment', fieldLabel: 'Payment' },
                                            {
                                                xtype: 'button', id: 'btnGen', text: 'Refresh',
                                                listeners: {
                                                    'click': function () {
                                                        computeBiWkly();
                                                        $.getJSON('/Utility/generatePaymentDates',
                                                        {
                                                            loanamt: Ext.fly('mLoanAmt').getValue(), intrate: Ext.fly('mAnnIntRate').getValue(), term: Ext.fly('mterm').getValue(),
                                                            fPayDte: Ext.fly('mfpaydate').getValue(), cmpPeriod: Ext.fly('mcompPeriod').getValue(), strPayFrequency: Ext.fly('mpayFreq').getValue(),
                                                            pyDue: Ext.fly('mbipayment').getValue()
                                                        }, function (data) {
                                                            Ext.getCmp('pScheduleGrd').getStore().removeAll();
                                                            Ext.getCmp('pScheduleGrd').getStore().loadData(data);
                                                            $('#btnsavegendata').show();
                                                            $('#mPMIMonthly').trigger('focus');
                                                        });
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                width: '70%',
                                items:
                                [
                                    {
                                        xtype: 'form',
                                        id: 'grdFrm',
                                        title: 'Generated Payment Plan',
                                        height: 300, frame: true, border: true, autoScroll: true,
                                        items:
                                        [
                                            pScheduleGrd,
                                            {
                                                xtype: 'button', id: 'btnsavegendata', text: 'Save Data',
                                                listeners: {
                                                    'render': function () {
                                                        $('#btnsavegendata').hide();
                                                    },
                                                    'click': function () {
                                                        var clId = Ext.fly('cl_iD').getValue();
                                                        var msn = Ext.fly('mSn').getValue();
                                                        var mon = Ext.fly('mOn').getValue();
                                                        var lnId = Ext.fly('cLnId').getValue();

                                                        if (clId.length > 0 && msn.length > 0 && mon.length > 0 && lnId.length > 0) {
                                                            var tF = Ext.getCmp('grdFrm').getForm();
                                                            if (tF.isValid()) {
                                                                tF.submit({
                                                                    clientValidation: true,
                                                                    method: 'POST',
                                                                    reset: true,
                                                                    url: '/Mortgage/SRoutine',
                                                                    params: {
                                                                        loanamt: Ext.fly('mLoanAmt').getValue(), intrate: Ext.fly('mAnnIntRate').getValue(), term: Ext.fly('mterm').getValue(),
                                                                        fPayDte: Ext.fly('mfpaydate').getValue(), cmpPeriod: Ext.fly('mcompPeriod').getValue(), strPayFrequency: Ext.fly('mpayFreq').getValue(),
                                                                        pyDue: Ext.fly('mbipayment').getValue(), lnId: Ext.fly('cLnId').getValue(), clId: Ext.fly('cl_iD').getValue()
                                                                    },
                                                                    success: function () {
                                                                        Ext.Msg.alert('SUCCESS', 'Payment Schedule saved successfully', this);
                                                                        Ext.getCmp('pScheduleGrd').getStore().removeAll();
                                                                        Ext.getCmp('frmCalculator').getForm().reset();
                                                                        Ext.getCmp('asfcsearch').getForm().reset();
                                                                    },
                                                                    error: function () { },
                                                                    waitTitle: 'Processing...',
                                                                    waitMsg: 'Saving Payment Schedule.Please wait'
                                                                });
                                                            } //end of isValid condition
                                                        }
                                                        else { Ext.Msg.alert('ENTER CLIENT/LOAN IDs', 'Please provide Client and Loan IDs to proceed', this); } //end of if condition
                                                    }
                                                } //listeners end
                                            }//btnsavegendata end
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
               ]
           });

           //template
           var myTpl = new Ext.Template(
                    '<tpl for=".">',
                    '<div class="thumb">{name}</div>',
                    '</tpl>',
                    { compiled: true, disableFormats: true, data: { name: 'testing'} }
            );
           myTpl.compile();

           var callRpt = new Ext.form.FormPanel({
               id: 'callRpt', title: 'Asset Finance Call Report Module', frame: true, border: true, autoScroll: true, height: '90%',
               items: [
                    {
                        xtype: 'form', title: 'Client Search', layout: 'column', defaults: { xtype: 'textfield', width: '35%' },
                        items: [
                            {
                                xtype: 'combo', id: 'rptparam', fieldLabel: 'Search Parameter', mode: 'local',
                                store: ['Surname of Applicant', 'First name of Applicant'], //'Client ID of Applicant'],
                                typeAhead: true, forceSelection: true, emptyText: 'select search parameter', columnWidth: .3,
                                listeners: {
                                    select: function () {
                                        var flg = null;
                                        var str = this.getValue();
                                        if (str == "Client ID of Applicant") { flg = "cl" } else if (str == "Surname of Applicant") { flg = "sn" } else if (str == "First name of Applicant") { flg = "fn" }
                                        if ($('#rptsearch').val() != "enter search value") {
                                            getClientForGrid(flg, $('#rptsearch').val());
                                        }
                                    }
                                }
                            },
                            {
                                id: 'rptsearch', fieldLabel: 'Search Field', enableKeyEvents: true, columnWidth: .3, value: 'enter search value',
                                listeners: {
                                    'focus': function () {
                                        Ext.getCmp('rptsearch').setValue('');
                                    },
                                    'keyup': function () {
                                        var flg = null;
                                        var strng = Ext.fly('rptparam').getValue();
                                        if (strng.length > 0 && strng != "select search parameter") {
                                            if (strng == "Client ID of Applicant") { flg = "cl" } else if (strng == "Surname of Applicant") { flg = "sn" } else if (strng == "First name of Applicant") { flg = "fn" }
                                            getClientForGrid(flg, this.getValue());
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'button', id: '', text: 'Refresh', columnWidth: .1,
                                listeners: {
                                    click: function (btn) {
                                        Ext.Msg.alert('REFRESH EVENT', 'Refreshes the grid', this);
                                    }
                                }
                            }

                        ]
                    },
                    CallRptGrd,
                    {
                        xtype: 'panel', layout: 'column', frame: true, width: '100%',
                        items: [
                            {
                                xtype: 'tabpanel',
                                id: 'tbcallreport',
                                activeTab: 0,
                                deferredRender: false,
                                layoutOnTabChange: true,
                                border: false,
                                flex: 1,
                                plain: true,
                                defaults: { height: '10%' }, columnWidth: .8,
                                items:
                                [
                                {
                                    xtype: 'container', title: 'Client Details', bodyStyle: 'padding:6px 6px 0', defaults: { xtype: 'textfield' },
                                    items: [
                                    {
                                        xtype: 'panel', layout: 'column',
                                        items: [
                                            {
                                                xtype: 'form', width: '50%', defaults: { xtype: 'textfield', width: '80%' }, frame: true,
                                                items: [
                                                    { xtype: 'numberfield', id: 'cdcid', fieldLabel: 'Client Id' },
                                                    { id: 'cdsn', fieldLabel: 'Surname' },
                                                    { id: 'cdon', fieldLabel: 'Other names' },
                                                    { id: 'cdidt', fieldLabel: 'Id Type' },
                                                    { xtype: 'textarea', id: 'cdrsAddr', fieldLabel: 'Residential Address' }
                                                ]
                                            },
                                            {
                                                xtype: 'form', width: '50%', defaults: { xtype: 'textfield', width: '80%' }, frame: true,
                                                items: [
                                                    { id: 'cdidn', fieldLabel: 'Id Number' },
                                                    { id: 'cdcel', fieldLabel: 'Cell Phone' },
                                                    { id: 'cdtel', fieldLabel: 'Telephone' },
                                                    { id: 'cdem', fieldLabel: 'Email' },
                                                    { xtype: 'textarea', id: 'cdprevAddr', fieldLabel: 'Previous Address' }

                                                ]
                                            }
                                        ]
                                    }
                                ]
                                },
                            {
                                xtype: 'container', title: 'Call Report', defaults: { xtype: 'textfield' }, frame: true,
                                items: [
                                    {
                                        xtype: 'panel', layout: 'column',
                                        items: [
                                            {
                                                xtype: 'form', width: '50%', defaults: { width: '50%', xtype: 'numberfield' }, frame: true,
                                                items: [
                                                    { id: 'expI', fieldLabel: 'Expected Income' },
                                                    { id: 'accB', fieldLabel: 'Account Balance' },
                                                    { id: 'stGoods', fieldLabel: 'Goods in stock' }
                                                ]
                                            },
                                            {
                                                xtype: 'form', width: '50%', defaults: { width: '50%', xtype: 'numberfield' }, frame: true,
                                                items: [
                                                    { id: 'stCap', fieldLabel: 'Stock Capital' },
                                                    { id: 'dSales', fieldLabel: 'Daily Sales' },
                                                    { xtype: 'textfield', id: 'bsNat', fieldLabel: 'Business Nature' }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            { xtype: 'htmleditor', id: 'cana', title: 'Credit Analyst' },
                            { xtype: 'htmleditor', id: 'rmgr', title: 'Risk Manager' },
                            { xtype: 'htmleditor', id: 'gmgr', title: 'General Manager' },
                            { xtype: 'htmleditor', id: 'ogbolor', title: 'CEO', defaults: { xtype: 'htmleditor'} }
                        ],
                                buttons: [
                                {
                                    id: 'btnCrptSave', text: 'Save',
                                    listeners: {
                                        'click': function () {
                                            var tb = Ext.getCmp('tbcallreport');
                                            var activeTab = tb.getActiveTab();
                                            var activeTabIndex = tb.items.findIndex('id', activeTab.id);

                                            saveCallRpt(activeTabIndex, _clId, _lnId, "save");
                                        }
                                    }
                                },
                                {
                                    id: 'btnAppr', text: 'Approve',
                                    handler: function () {
                                        var tb = Ext.getCmp('tbcallreport');
                                        var activeTab = tb.getActiveTab();
                                        var activeTabIndex = tb.items.findIndex('id', activeTab.id);

                                        saveCallRpt(activeTabIndex, _clId, _lnId, "approve");
                                    }
                                },
                                { id: '', text: 'Reject' }
                                /* ,{ id: '', text: 'Reports' } */
                            ]
                            },
                         {
                             xtype: 'panel', columnWidth: .2, frame: true,
                             items: [
                                 { xtype: 'numberfield', id: 'recAmt', fieldLabel: 'Rec. Amount', emptyText: 'Recommended Amount' },
                                 { xtype: 'numberfield', id: '', fieldLabel: 'Appr. Amount', emptyText: 'Approved Amount' },
                                 {
                                     xtype: 'panel', title: 'Picture', id: 'pix', height: '20%', frame: true, border: true
                                     , renderTo: Ext.get('pix')
                                     , tpl: new Ext.XTemplate(
                                        '<div style="max-width:100%;max-height:100%;">',
                                                '<img style="width:200px;height:150px;" alt="{alternative}" src="{path}">',
                                        '</div>'
                                     ),
                                     id: 'mainPic', compiled: true, disableFormats: true, data: { path: def_pic, alternative: 'path to image' }, compiled: true, disableFormats: true
                                 }
                             ]

                         }
                        ]
                    }

                ]
           });



           //processes form
           var ProcForm = new Ext.form.FormPanel({
               id: 'ProcForm',
               height: 900,
               width: 'auto',
               frame: true,
               border: true,
               layout: 'card',
               autoScroll: true,
               activeItem: 0,
               items: [
                        jntApp,
                        empDataForm,
                        calcForm,
                        callRpt
                    ]
           });


           new Ext.Viewport({
               layout: 'border',
               items: [{
                   region: 'north',
                   html: '<h1 class="x-panel-header">Assets Finance Module</h1>',
                   autoHeight: true,
                   border: false,
                   margins: '0 0 5 0'
               }, {
                   region: 'west',
                   collapsible: true,
                   title: 'Processes',
                   width: 200,
                   items: [
                            {
                                xtype: 'treepanel',
                                id: 'tprocesses',
                                width: 'auto',
                                height: 900,
                                autoScroll: true,
                                frame: true,
                                border: true,
                                root: {
                                    text: 'Asset Finances Processes',
                                    expanded: true,
                                    children: [
                                        {
                                            text: 'Application',
                                            id: 'japp',
                                            leaf: true,
                                            listeners: {
                                                'click': function (node) {
                                                    Ext.getCmp('ProcForm').layout.setActiveItem(0);
                                                }
                                            }
                                        },
                                        {
                                            text: 'Employment Data',
                                            id: 'jempdata',
                                            leaf: true,
                                            listeners: {
                                                click: function (node) {
                                                    Ext.getCmp('ProcForm').layout.setActiveItem(1);
                                                }
                                            }
                                        },
                                        {
                                            text: 'Calculator',
                                            id: 'jCalc',
                                            leaf: true,
                                            listeners: {
                                                click: function (node) {
                                                    Ext.getCmp('ProcForm').layout.setActiveItem(2);
                                                }
                                            }
                                        },
                                        {
                                            text: 'Call Report',
                                            id: 'jCallRpt',
                                            leaf: true,
                                            listeners: {
                                                click: function (node) {
                                                    Ext.getCmp('ProcForm').layout.setActiveItem(3);
                                                    getClientForGrid("*", "");  //get general data here
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
               }, {
                   region: 'center',
                   width: 1000,
                   items: [ProcForm]
               }]

           });

           var getRecord = function (param, ctrSn, ctrFns) {
               $.getJSON('/Utility/fetchClient',
                { cId: param },
                function (dat) {

                    $.each(dat, function (i, obj) {
                        ctrSn.val($.trim(obj.surname));
                        ctrFns.val($.trim(obj.firstname));
                    });
                });
           }

           var getClientForGrid = function (param1, param2) {
               $.getJSON('/Utility/getClients'
               , { searchParam: param1, strParam: param2 }
               , function (dta) {
                   rptdata = dta;
                   Ext.getCmp('CallRptGrd').getStore().removeAll();
                   Ext.getCmp('CallRptGrd').getStore().loadData(dta);
               });
           }

           var saveCallRpt = function (idx, cId, lId, _status) {
               switch (idx) {
                   case 1:
                       $.post('/Mortgage/SaveCallReport',
                       {
                           ei: $('#expI').val(), acb: $('#accB').val(), stg: $('#stGoods').val(),
                           stcap: $('#stCap').val(), dsales: $('#dSales').val(), bnat: $('#bsNat').val(), lnId: lId, cId: _clId
                       },
                       function (stat) {
                           if (stat.toString() == "true") {
                               Ext.Msg.alert('CALL REPORT', 'Call Report save successfully', this);
                           }
                       });
                       break;
                   case 2:
                       save(idx, cId, lId, encodeURI($('#cana').val()), _status);
                       break;
                   case 3:

                       save(idx, cId, lId, encodeURI($('#rmgr').val()), _status);
                       break;
                   case 4:
                       save(idx, cId, lId, encodeURI($('#gmgr').val()), _status);
                       break;
                   case 5:
                       save(idx, cId, lId, encodeURI($('#ogbolor').val()), _status);
                       break;
               }
           }

           var save = function (idx, cId, lId, message, stat) {

               $.post("/Mortgage/SaveCR",
                       { Idx: idx, loanID: lId, msg: message, rAmt: Ext.fly('recAmt').getValue(), status: stat },
                       function (msg) {
                           if (msg.toString() == "true") {
                               Ext.Msg.alert('CALL REPORT', 'Call Report evaluation saved successfully', this);
                           }
                           else { Ext.Msg.alert('ASSET FINANCE 1.0', msg.toString(), this); }
                       });
           }

           var getCallRpt = function (c, l, dta) {
               /* fetch call report and the data that is already there */
               $.getJSON('/Utility/getCallReport',
               { cId: c, lId: l }, function (d) {
                   console.info(d);
                   /* */
                   $.each(d, function (i, obj) {
                       $('#expI').val(obj.expIncome);
                       $('#accB').val(obj.accBalance);
                       $('#stGoods').val(obj.stockedGoods);
                       $('#stCap').val(obj.stockCapital);
                       $('#dSales').val(obj.dailySales);
                       $('#bsNat').val(obj.businessNature);

                       Ext.getCmp('cana').setValue(decodeURI(obj.creditAnalyst));
                       Ext.getCmp('rmgr').setValue(decodeURI(obj.riskAnalyst));
                       Ext.getCmp('gmgr').setValue(decodeURI(obj.genMgr));
                       Ext.getCmp('ogbolor').setValue(decodeURI(obj.ceo));
                   });
               });
               $.each(dta, function (idx, v) {
                   if (l == v.loanId.toString()) {
                       $('#cdcid').val(v.clientId).attr('readonly', true);
                       $('#cdsn').val(v.surname).attr('readonly', true);
                       $('#cdon').val(v.firstname).attr('readonly', true);
                       $('#cdidt').val(v.idtype).attr('readonly', true);
                       $('#cdrsAddr').val(v.resAddr).attr('readonly', true);
                       $('#cdidn').val(v.idNo).attr('readonly', true);
                       $('#cdcel').val(v.mobile).attr('readonly', true);
                       $('#cdtel').val(v.phoneNo).attr('readonly', true);
                       $('#cdem').val(v.email).attr('readonly', true);
                       $('#cdprevAddr').val(v.prevAddr).attr('readonly', true);
                   }
               });
           }

           function computeBiWkly() {

               var s = 0.00;
               if (Ext.fly('mLoanAmt').getValue().length > 0 && Ext.fly('mAnnIntRate').getValue().length > 0
                        && Ext.fly('mterm').getValue().length > 0 && Ext.fly('mfpaydate').getValue().length > 0
                            && Ext.fly('mcompPeriod').getValue().length > 0 && Ext.fly('mpayFreq').getValue().length > 0) {

                   myApp.setLoanAmount(Ext.fly('mLoanAmt').getValue());
                   myApp.setAnnualInterestRate(Ext.fly('mAnnIntRate').getValue());
                   myApp.setTermLength(Ext.fly('mterm').getValue());
                   myApp.setFirstPayDate(Ext.fly('mfpaydate').getValue());
                   myApp.setCompoundPeriod(Ext.fly('mcompPeriod').getValue());
                   myApp.setPaymentFreq(Ext.fly('mpayFreq').getValue());

                   myApp.computeBiWeekly();
                   $('#mbipayment').val(myApp.getBiWeekly());
               }
               else { }
           }


    //   });
   
    
    }

});