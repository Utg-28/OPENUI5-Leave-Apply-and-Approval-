sap.ui.define([
    './BaseController',
    "sap/ui/core/Fragment",
    'sap/ui/model/JSON/JSONModel',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/message/Message",
    "../formatter/leaveformatter",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    "sap/m/MessageBox",
], function (BaseController, Fragment, JSONModel, Filter, FilterOperator, Message, formatter, Export, ExportTypeCSV,MessageBox) {

    'use strict';
    return BaseController.extend('webapp.controller.Listpage', {
        formatter: formatter,
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oView = this.getView();

            this.getOwnerComponent().getModel('leavedata').refresh(true);

            var oSerchmodel = new JSONModel({
                "leaveid": "",
                "empname": "",
                "type": "",
                "status": ""
            })
            this.getView().setModel(oSerchmodel, 'searchmodel');
            var oMessageManager = sap.ui.getCore().getMessageManager();
            this.oView.setModel(oMessageManager.getMessageModel(), "message");

            // or just do it for the whole view
            oMessageManager.registerObject(this.oView, true);
        },

        onPresstodetail: function (oEvent) {

            var oItem = oEvent.getSource();
            this.oRouter.navTo('nDetailpagefromlist', {
                id: window.encodeURIComponent(oItem.getBindingContext("leavedata").getPath().substr(1))
            })
        },
        onSearch: function (oEvent) {
            var oview = this.oView;
            var oButtun = oEvent.getSource()
            if (!this.pPopover) {
                this.pPopover = Fragment.load({
                    name: "webapp.view.Search",
                    controller: this
                })
            }
            this.pPopover.then(function (oPopover) {
                oview.addDependent(oPopover)
                oPopover.openBy(oButtun);
            })
        },
        onNewapply: function () {

            this.oRouter.navTo('nDetailpagefromplus', {
                id: window.encodeURIComponent('newleave')
            })
        },
        onvalueHelpRequest1: function (oEvent) {

            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialog1) {
                this._pValueHelpDialog1 = Fragment.load({
                    id: oView.getId(),
                    name: "webapp.view.list",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog1.then(function (oDialog) {
                oDialog.open();
            });

        },
        onvalueHelpRequest2: function (oEvent) {

            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "webapp.view.name",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                oDialog.open();
            });

        },
        onValueHelpClose1: function (oEvent) {

            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sap.ui.getCore().byId("leaveid").setValue(oSelectedItem.getTitle())

        },
        onValueHelpClose2: function (oEvent) {

            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sap.ui.getCore().byId("employeename").setValue(oSelectedItem.getTitle());

        },

        onSubmitPress: function (oEvent) {
            var oFilteredArray = []

            var oQueryValueid = this.getView().getModel('searchmodel').getProperty('/leaveid')

            oQueryValueid.trim();
            var oQueryValuename = this.getView().getModel('searchmodel').getProperty('/empname')
            
            var oQueryEmployeearray = this.getView().getModel('employedata').getData()['Employees']
            var oQueryEmployeeid = -1;
            
            oQueryEmployeearray.forEach((val) => {
                if (val['empname'] === oQueryValuename) {
                    oQueryEmployeeid = val['empid'];
                }
            })

            var oQueryValuetype = this.getView().getModel('searchmodel').getProperty('/type')
            var oQueryValuestatus = this.getView().getModel('searchmodel').getProperty('/status')

           // if(!p)
            if (oQueryValueid != '' && oQueryValuename) {
                oFilteredArray.push(new Filter([
                    new Filter('Leaveid', FilterOperator.Contains, oQueryValueid),
                    new Filter('EmployeeId', FilterOperator.Contains, oQueryEmployeeid),
                ], true))                                         //false -> union 
            } else if (oQueryValueid) {
                oFilteredArray.push(new Filter("Leaveid", FilterOperator.Contains, oQueryValueid))
            }
            else if (oQueryValuename) {
                oFilteredArray.push(new Filter("EmployeeId", FilterOperator.Contains, oQueryEmployeeid))
            }
            

            var oTable = this.byId("leavetable");
            var oBinding = oTable.getBinding('items');
            oBinding.filter(oFilteredArray);

            this.onResetPress();
        //    this.onCancelpress();
            if(this.pPopover){
                this.pPopover.then(function (oDialog) {
                    oDialog.close();
                })
            }

        }, onResetPress: function () {

            this.getView().getModel('searchmodel').setProperty('/leaveid', "")
            this.getView().getModel('searchmodel').setProperty('/empname', "")
            this.getView().getModel('searchmodel').setProperty('/type', "")
            this.getView().getModel('searchmodel').setProperty('/status', "")
        },
        onCancelpress: function () {

            this.pPopover.then(function (oDialog) {
                oDialog.close();
            })
        },
        onfullistpress: function () {
            //var p=true;
            this.onSubmitPress();
        },
        onDataExport: function () {
            debugger;
            var oExport = new Export({

                exportType: new ExportTypeCSV({
                    separatorChar: ";"
                }),

                models: this.getView().getModel('leavedata'),

                rows: {
                    path: "/Leavesapplied"
                },

                columns: [
                    {
                        name: "Leaveid",
                        template: {
                            content: "{Leaveid}"
                        }
                    },
                    {
                        name: "Employee Id",
                        template: {
                            content: "{EmployeeId}"
                        }
                    },
                    {
                        name: "Start date",
                        template: {
                            content: "{Startdate}"
                        }
                    }, {
                        name: "End date",
                        template: {
                            content: "{Enddate}"
                        }
                    }, {
                        name: "Type",
                        template: {
                            content: "{type}"
                        }
                    }, {
                        name: "Reason",
                        template: {
                            content: "{Reason}"
                        }
                    }]
            });

            // download exported file
            oExport.saveFile().catch(function (oError) {
                MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
            }).then(function () {
                oExport.destroy();
            });
        }


    });
});