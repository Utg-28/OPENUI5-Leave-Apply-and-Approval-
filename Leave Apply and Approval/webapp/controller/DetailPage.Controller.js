sap.ui.define([
    './BaseController',
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../formatter/leaveformatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, MessageBox, MessageToast) {
    'use strict';
    return BaseController.extend('webapp.controller.Detailpage', {
        formatter: formatter,
        onInit: function () {
            this.i = 0;
            var oEditModel = new JSONModel({
                "input": false,
                "buttonvisible": false
            })
            this.getView().setModel(oEditModel, 'edit');
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("nDetailpagefromlist").attachPatternMatched(this._onObjectMatchedfromlist, this);
            oRouter.getRoute("nDetailpagefromplus").attachPatternMatched(this._onObjectMatchedfromplus, this);
            var oMessageManager = sap.ui.getCore().getMessageManager();
            this.getView().setModel(oMessageManager.getMessageModel(), "message");

            // or just do it for the whole view
            oMessageManager.registerObject(this.getView(), true);
            var now = new Date();
            this.byId('startdate').setMinDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
            this.byId('startdate').setMaxDate(new Date(now.getFullYear(), now.getMonth() + 2, now.getDate()))
            this.byId('enddate').setMinDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
            this.byId('enddate').setMaxDate(new Date(now.getFullYear(), now.getMonth() + 2, now.getDate()))
            

        },
        padLeddingZeros: function (num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        },

        _onObjectMatchedfromplus: function (oEvent) {
            this.getView().getModel('edit').setProperty('/input', true);
            this.getView().getModel('edit').setProperty('/buttonvisible', false);
            this.i=1;
            var newid = this.getView().getModel('leavedata').getProperty('/Leavesapplied').length
            newid++;
            var paddedid = this.padLeddingZeros(newid, 10);
            this.byId('headertext').setText('New Apply')
            this.byId('headerstatus').setText('Applied')
            var oNewmodel = new JSONModel({
                "name": "",
                "EmployeeId": "",
                "Leaveid": paddedid,
                "Startdate": "",
                "Enddate": "",
                "type": "",
                "Contactno": "",
                "Reason": "",
                "Status": "Applied",
                "sick": 0,
                "casual": 0
            })
            this.dataindex = 'nan'
            this.getView().setModel(oNewmodel, 'newdata');

            this.byId('status').setEditable(false);


            //for previours leaves
            var omodel1 = this.getView().getModel('leavedata').getData()["Leavesapplied"]
            var oPreviousmodelarray = []
            omodel1.forEach((val) => {
                if (val.EmployeeId === oNewmodel['EmployeeId'] && val.Leaveid != oNewmodel['Leaveid']) {
                    oPreviousmodelarray.push(val)
                }
            })
            var oPreviousmodel = new JSONModel(oPreviousmodelarray)
            this.getView().setModel(oPreviousmodel, 'previous')

        },
        _onObjectMatchedfromlist: function (oEvent) {
            this.i=0;
            // this.byId('status').setEditable(true);
            this.byId('status').setEditable(false)
            this.getView().getModel('edit').setProperty('/input', false);
            this.getView().getModel('edit').setProperty('/buttonvisible', false);

            var path = window.decodeURIComponent(oEvent.getParameter("arguments").id)
            var index = path.lastIndexOf('/');
            index++;
            this.dataindex = path.substring(index);
            this.dataindex = parseInt(this.dataindex);
            var data = this.getView().getModel('leavedata').getData()["Leavesapplied"][this.dataindex]

            var empid = data['EmployeeId'];
            var omodel = this.getOwnerComponent().getModel('employedata').getData()['Employees'];
            var result = [];
            omodel.forEach((val) => {
                if (val.empid == empid) {
                    result.push(val.empname),
                    result.push(val.ContactNo),
                    result.push(val.sickleavetake),
                    result.push(val.casualleavetaken)
                }
            })
            var newdata = JSON.parse(JSON.stringify(data));
            var odata = new JSONModel({
                "name": result[0],
                "EmployeeId": newdata['EmployeeId'],
                "Leaveid": newdata['Leaveid'],
                "Startdate": newdata['Startdate'],
                "Enddate": newdata['Enddate'],
                "type": newdata['type'],
                "Contactno": result[1],
                "Reason": newdata['Reason'],
                "Status": newdata['Status'],
                "sick": result[2],
                "casual": result[3]
            })

            this.getView().setModel(odata, 'newdata');
            if (newdata['Status'] == 'Approved' || newdata['Status'] == 'Reject') {
                this.byId('editbutton').setVisible(false);
                this.byId('status').setEditable(false)
            }
            else {
                this.byId('editbutton').setVisible(true);
            }


            //for previours leaves
            var omodel1 = this.getView().getModel('leavedata').getData()["Leavesapplied"]
            var oPreviousmodelarray = []
            omodel1.forEach((val) => {
                if (val.EmployeeId === newdata['EmployeeId'] && (val.Leaveid != newdata['Leaveid'] && val.Enddate <= newdata['Startdate'])) {
                    oPreviousmodelarray.push(val)
                }
            })

            var oPreviousmodel = new JSONModel(oPreviousmodelarray)
            this.getView().setModel(oPreviousmodel, 'previous')

        },
        onedit: function () {
            if (this.i % 2 == 0) {
                this.getView().getModel('edit').setProperty('/input', true);
                this.byId('status').setEditable(true);
                this.i++;
            }
            else {
                this.getView().getModel('edit').setProperty('/input', false);
                this.byId('status').setEditable(false);
                this.i++;
                this.i %= 2;
            }
        },
        onchangecomboboxstatus:function(){
          //  debugger;
            if(this.getView().byId('status').getValue() != 'Approved' && this.getView().byId('status').getValue() != 'Reject' && this.getView().byId('status').getValue() != 'Applied' ){
                MessageBox.warning("Enter Valid Status");
                this.byId('status').setValue('');
                return
            }
            
        },
        onchangecomboboxtype:function(){
         //   debugger;
            if(this.byId('check3').getValue()!= 'Sick' && this.byId('check3').getValue()!= 'Casual'){
                MessageBox.warning("Enter Valid Type");
                this.byId('check3').setValue('')
                return;
            }
        },
        onsubmitform: function () {
            if (this.byId('check1').getValue() == '' ||
                this.byId('check2').getValue() == '' ||
                this.byId('check3').getValue() == '' ||
                this.byId('check4').getValue() == '' ||
                this.byId('check5').getValue() == '') {
                MessageBox.warning("Enter Valid Value");
                return;
            }
            var start = this.byId('startdate').getDateValue()
            var end = this.byId('enddate').getDateValue()
            if (end - start < 0) {
                MessageBox.warning("End Date Should be greater that Beggining date");
                return;
            }
       
            var oModel = this.getOwnerComponent().getModel('leavedata').getData()["Leavesapplied"]
            var oEmpmodel = this.getOwnerComponent().getModel('employedata').getData()["Employees"]
            var newd = this.getView().getModel('newdata').getData();
            var indataset = false;
            for (var i = 0; i < oModel.length; i++) {
                if (oModel[i]['Leaveid'] === newd['Leaveid']) {
                    indataset = true;
                    var data = this.getView().getModel('leavedata').getData()["Leavesapplied"][this.dataindex]
                    data.Leaveid = newd['Leaveid'],
                    data.EmployeeId = newd['EmployeeId'];
                    data.Startdate = newd['Startdate'];
                    data.Enddate = newd['Enddate'];
                    data.type = newd['type'];
                 

                    for (var j = 0; j < oEmpmodel.length; j++) {
                        if (oEmpmodel[j]['empid'] == newd['EmployeeId']) {
                            var model = oEmpmodel[j];
                            model['empname'] = newd['name'];
                            model['ContactNo'] = newd['Contactno']
                            if (this.byId('status').getValue() === 'Reject' || this.byId('status').getValue() === 'Approved') {
                                this.getView().getModel('edit').setProperty('/input', false);
                                this.getView().getModel('edit').setProperty('/buttonvisible', false);
                                this.byId('status').setEditable(false)
                                data.Status = newd['Status'];
                            }

                            if (this.byId('status').getValue() === 'Approved') {
                                var type = newd['type'];
                                var start = this.byId('startdate').getDateValue()
                                var end = this.byId('enddate').getDateValue()
                                var days = (end - start) / (1000 * 24 * 60 * 60)
                                if (start > new Date()) {

                                    if (type == 'Casual') {
                                        model['casualleavetaken'] += days;
                                        var remaining = this.byId('casual').getText()
                                        var rem = formatter.leavecalculator(remaining, model['casualleavetaken'])
                                        this.byId('casual').setText(rem);
                                    }
                                    else {
                                        model['sickleavetake'] += days;
                                    }

                                    data.Status = newd['Status'];

                                }
                                else {
                                    MessageToast.show('Cant Be approved Start Date have gone');
                    
                                    data.Status = newd['Status'];   
                                    this.getView().getModel('newdata').setProperty('/Status','Applied');
                                    data.Status='Applied'
                                    this.getView().getModel('newdata')
                                  //  this.getView().
                                    this.byId('status').setEditable(false);
                                 //   this.byId('status').setSelectedText('Applied');
                                    this.getView().getModel('newdata').refresh()
        
                                    return;
                                }
                            }
                            break;
                        }
                    }
                    break;

                }
            }

            if (!indataset) {

                var odatamodel = {
                    'Leaveid': newd['Leaveid'],
                    'EmployeeId': newd['EmployeeId'],
                    'Startdate': newd['Startdate'],
                    'Enddate': newd['Enddate'],
                    'type': newd['type'],
                    'Reason': newd['Reason'],
                    'Status': newd['Status']
                }
                oModel.push(odatamodel);
                var onewEmpmodel = {
                    "empid": newd['EmployeeId'],
                    "empname": newd['name'],
                    "ContactNo": newd['Contactno'],
                    "sickleavetake": newd['sick'],
                    "casualleavetaken": newd['casual']
                }

                oEmpmodel.push(onewEmpmodel);

               
            }
            this.getOwnerComponent().getModel('leavedata').refresh();
            this.getOwnerComponent().getModel('employedata').refresh();
            this.onBacktoListpage();
        },
        oncancelform: function () {
            this.onBacktoListpage();
        },
        onBacktoListpage: function () {
            this.getView().getModel('edit').setProperty('/input', false);
            this.getView().getModel('edit').setProperty('/buttonvisible', false);
            this.byId('status').setEditable(false)

            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            }
        }
    })
});