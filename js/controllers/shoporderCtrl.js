'use strict';
angular.module("cummins-supervisorio").controller("shoporderCtrl", function($scope, ThingManagement, portsAPI, $q, $mdDialog, $http, imageSrc, dialogHandler, TilePreview, $timeout, $interval, $window, orderByManagement, $sce, collapseManager) {
    //Declaração de Variaveis de uso geral
    $scope.orderList = [];
    $scope.orderSelect = {};
    $scope.SelectOrder = {};
    $scope.newOrder = {};
    $scope.newThing = {};
    $scope.addcharacteristic = {};
    $scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
    $scope.emailGroup = [
        {
            "key": "Grupo A",
        },
        {
            "key": "Grupo B",
        },
        {
            "key": "Grupo C",
        }
    ];
    $scope.estagioGroup = [
        {
            "estag": "Estágio 1",
        },
        {
            "estag": "Estágio 2",
        },
        {
            "estag": "Estágio 3",
        }
    ];

    
    $scope.closeModal = function (_id) {
        hideModal(_id);
    };

    $scope.openModal = function (_id, _msg) {
        showModal(_id, _msg);
        $scope.dialogMsg = _msg;
    };

    var getShopOrder = function () {
        $scope.dataLoading = true;

        portsAPI.getShopOrder().success(function (PEGA_O_VALOR_QUEM_VEM_DO_GET_ATRAVEZ_DE_UM_CALLBACK) {
            //Pega as order e coloca na variavel
            $scope.orderList = PEGA_O_VALOR_QUEM_VEM_DO_GET_ATRAVEZ_DE_UM_CALLBACK;
            SetDefault();
            $scope.dataLoading = false;
                 
        })
    }

    var getGrupoEmail = function () {
        $scope.dataLoading = true;

        portsAPI.getGrupoEmail().success(function(data){
            $scope.emailGroup = data;
        })
    }
    var getGrupoEstagio = function () {
        $scope.dataLoading = true;

        portsAPI.getGrupoEstagio().success(function(data){
            $scope.estagioGroup = data;
        })
    }

    var SetDefault = function () {
        $scope.orderSelect = $scope.orderList[0];
    }; 
    
    $scope.orderBy = function (field, _id) {
        orderByManagement.orderBy($scope, field, _id);
    };
    
    $scope.selectOrder = function (thing) {
        $scope.selectedOrder = thing;
        console.log(thing)
    };
    
    $scope.toggle = function (_id, _class) {
        var viewId = 'view-detail-' + _id;
        collapseManager.ToggleDetail(viewId, _class);
        //toggleIcon(_id);
    };

    $scope.getInclude = function (tt) {
        return 'cadastro/orderDetails.html';
    };

    $scope.cadastro = function(order) {
        portsAPI.postOrder(order).success(function () {      
            $scope.newOrder = {}
        })
    }

    $scope.editOrder = function(order) {
        portsAPI.putAlterOrder(order).success(function(){
            getShopOrder()
        })
    }
    $scope.addNewGroup = function(valueSelect, selectedOrder){
        var objeto = {"groupEmails": valueSelect.groupEmails, "estags": valueSelect.estags}    
        if(selectedOrder.groupResult == undefined){
            selectedOrder.groupResult = []
            }
        console.log(selectedOrder)
        console.log(valueSelect)                            
       selectedOrder.groupResult.push(objeto)
 
         
        };
        $scope.deleteGroup = function(selectedOrder, x){
           var index = selectedOrder.groupResult.findIndex(function(){
               return x
           })
            selectedOrder.groupResult.splice(index, 1)
             
             };

    

    //chama função ao entrar na página para pegar itens
    getShopOrder()
    
});