/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


﻿'use strict';

angular.module("cummins-supervisorio").controller("cycleTimeLineReportCtrl", function ($scope, $http, $sce, reportUtilsService, portsAPI) {

    /**
     * Model object shared among view and controller
     */
    $scope.modelObj = {};

    /**
     * Array of Areas to fill the combobox
     */
    $scope.AreasList = new Array();

    /**
     * Shows the report content returned by backend
     * @param {type} content
     * @returns {undefined}
     */
    var showReportContent = function (content) {
        console.log(content);
        console.log("Fired showReportContent");
        $scope.reportContent = $sce.trustAsHtml(content);
    };

    /**
     * Clear the inputed field values
     * @returns {undefined}
     */
    $scope.clearInputs = function () {
        console.log("Fired clearInputs");

        $scope.modelObj = null;

        $('.datepicker#report-cycletime-line-InitialDate').datepicker('update', '');
        $('.datepicker#report-cycletime-line-FinalDate').datepicker('update', '');

        if ($scope.AreasList.length > 0) {
            $('#report-cycletime-station-Area').multiselect('selectAll', false);
            $('#report-cycletime-station-Area').multiselect('refresh');
        }

        $('#report-cycletime-line-WS').multiselect('deselectAll', false);
        $('#report-cycletime-line-WS').multiselect('refresh');

        $('#report-cycletime-line-SO').multiselect('deselectAll', false);
        $('#report-cycletime-line-SO').multiselect('refresh');

        $('#report-cycletime-line-Family').multiselect('deselectAll', false);
        $('#report-cycletime-line-Family').multiselect('refresh');

        showReportContent("<p>No content yet.</p>");
    };

    /**
     * Generates the report
     * @returns {undefined}
     */
    $scope.generateReport = function () {
        console.log("Fired generateReport");

        if (validateInputs() === false)
            return;

        var reportContent = "<label class='text-primary' style='font-size: 1.5em;'><span class='glyphicon glyphicon-time' aria-hidden='true'></span> Aguarde...</labe1>";
        showReportContent(reportContent);

        if ($scope.modelObj == null)
            $scope.modelObj = {};

        // Get calendar's values
        $scope.modelObj.InitialDate = $scope.initialDateI;
		//Validação estranha $('#report-cycletime-line-InitialDate').datepicker('getFormattedDate');
        $scope.modelObj.FinalDate = $scope.finalDateI;
		//$('#report-cycletime-line-FinalDate').datepicker('getFormattedDate');
		console.log("Data inicial"+$scope.modelObj.InitialDate);
		console.log("Data inicial"+$scope.modelObj.FinalDate);
        // Get combos' values
        $scope.modelObj.Area = $('#report-cycletime-line-Area').val();
        $scope.modelObj.WS = $('#report-cycletime-line-WS').val();
        $scope.modelObj.SO = $('#report-cycletime-line-SO').val();
        $scope.modelObj.Family = $('#report-cycletime-line-Family').val();

        var queryParameters = reportUtilsService.generateQueryParametersFromModelObject($scope.modelObj);

        var url = portsAPI.getReportsAPI() + "/CycleTime/Line" + queryParameters;

        console.info("Report URL: " + url);

        var onSuccessGetReport = function (response) {
            console.log("Fired onSuccessGetReport");
            var reportContent = reportUtilsService.injectReportAPIUrlOnReportViewerResult(response.data);
            showReportContent(reportContent);
        };

        var onFailGetReport = function (response) {
            if (response.status === 403) {
                alert("Você não está logado ou não tem acesso aos Relatórios do Sistema");
                return;
            }
            console.log("Fired onFailGetReport");
            var msg = "Erro ao gerar o relatório: " + response.status + ": " + response.statusText;
            var reportContent = "<label class='text-danger' style='font-size: 1.5em;'><span class='glyphicon glyphicon-remove-circle' aria-hidden='true'></span> " + msg + "</labe1>";
            showReportContent(reportContent);
        };

        $http.get(url, {timeout: 8640000}).then(function (response) {
            if (response.status === 200)
                onSuccessGetReport(response);
            else
                onFailGetReport(response);
        }, function (response) {
            onFailGetReport(response);
        });
    };

    /**
     * Load avalable Areas
     * @returns {undefined}
     */
    var loadAvalableAreas = function () {

        var onSuccess = function (response) {

            console.log("Fired onSuccessLoadAvalableAreas");

            var data = response.data;

            var options = new Array();

            for (var i = 0; i < data.length; i++) {
                if (data[i].column1 == "" || data[i].column2 == "")
                    continue;
                var option = {label: data[i].column2, title: data[i].column2, value: data[i].column1};
                options.push(option);
            }

            $scope.AreasList = options;

            $('#report-cycletime-line-Area').multiselect('dataprovider', options);
        };

        var onFail = function (response) {
            console.log("Fired onFailLoadAvalableAreas");
            alert("Falhou ao buscar os valores de Areas para o combobox.");
        };

        var url = portsAPI.getReportsAPI() + "/CycleTime/GetAreas";

        console.log("URL Areas: " + url);

        $http.get(url, {timeout: 8640000}).then(onSuccess, onFail);
    };

    /**
     * This method clears the values on comboboxes
     * @returns {undefined}
     */
    var clearShopOrderAndFamilyFields = function () {
        console.log("Fired clearShopOrderAndFamilyFields");

        $('#report-cycletime-line-Family').multiselect('deselectAll', false);
        $('#report-cycletime-line-Family').multiselect('refresh');
        $('#report-cycletime-line-Family').multiselect('disable');

        $('#report-cycletime-line-WS').multiselect('deselectAll', false);
        $('#report-cycletime-line-WS').multiselect('refresh');
        $('#report-cycletime-line-WS').multiselect('disable');

        $('#report-cycletime-line-SO').multiselect('deselectAll', false);
        $('#report-cycletime-line-SO').multiselect('refresh');
        $('#report-cycletime-line-SO').multiselect('disable');

    };

    /**
     * Initializes the calendar objects
     * @returns {undefined}
     */
    var initializeFrontObjects = function ()
    {
        // Calendar Initial Date
        $('.datepicker#report-cycletime-line-InitialDate').datepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
            language: "pt-BR",
            todayHighlight: true
        });

        // Calendar Inital Date calls when his date changes
        $('.datepicker#report-cycletime-line-InitialDate').datepicker().on("changeDate", function (e) {
            clearShopOrderAndFamilyFields();
        });

        console.log("Inicializou InitialDate");

        // Calendar Final Date
        $('.datepicker#report-cycletime-line-FinalDate').datepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
            language: "pt-BR",
            todayHighlight: true
        });

        // Calendar Final Date calls when his date changes
        $('.datepicker#report-cycletime-line-FinalDate').datepicker().on("changeDate", function (e) {
            clearShopOrderAndFamilyFields();
        });

        console.log("Inicializou FinalDate");

        // Select combo WS
        $('#report-cycletime-line-Area').multiselect({
            numberDisplayed: 1,
            nSelectedText: " selecionados",
            buttonWidth: "100%",
            maxHeight: 200,
            onChange: function (option, checked, select) {
                clearShopOrderAndFamilyFields();
            }
        });

        console.log("Inicializou WS select");

        // Select combo SO
        $('#report-cycletime-line-WS').multiselect({
            numberDisplayed: 1,
            nSelectedText: " selecionados",
            buttonWidth: "100%",
            maxHeight: 200
        });

        // Select combo SO
        $('#report-cycletime-line-SO').multiselect({
            numberDisplayed: 1,
            nSelectedText: " selecionados",
            buttonWidth: "100%",
            maxHeight: 200
        });

        console.log("Inicializou SO select");

        // Select combo Family
        $('#report-cycletime-line-Family').multiselect({
            numberDisplayed: 1,
            nSelectedText: " selecionados",
            buttonWidth: "100%",
            maxHeight: 200
        });

        console.log("Inicializou Family select");
    };

    /**
     * Do a Ping on server
     * If the response is ok,
     * do other requests
     * @returns {undefined}
     */
    var startWithPing = function () {

        var onSuccess = function (response) {
            //loadAvalableWorkStations();
            loadAvalableAreas();
        };

        var onFail = function (response) {
            // Falhou miseravelmente ao comunicar-se com o servidor
            // Um mensagem de erro será exibida pelo angular para informar
            // o usuário.
        };

        var url = portsAPI.getReportsAPI() + "/Ping/AreYouThere";

        console.log("URL Ping: " + url);

        $http.get(url, {timeout: 8640000}).then(onSuccess, onFail);
    };

    var validateInputs = function () {
        var selectedArea = $('#report-cycletime-line-Area').val();
        var initialDate = $scope.initialDateI;
		//$('#report-cycletime-line-InitialDate').datepicker('getFormattedDate');
        var finalDate = $scope.finalDateI;
		//$('#report-cycletime-line-FinalDate').datepicker('getFormattedDate');

        if (selectedArea == null) {
            alert("Selecione a Área");
            return false;
        }

        if (initialDate == null || initialDate === "") {
            alert("Selecione a Data Inicial");
            return false;
        }

        if (finalDate == null || finalDate === "") {
            alert("Selecione a Data Final");
            return false;
        }

        return true;
    };

    /**
     * Loads Shop Orders and Families
     * @returns {undefined}
     */
    $scope.loadShopOrdersAndFamilies = function () {

        if (validateInputs() === false)
            return;

        var selectedArea = $('#report-cycletime-line-Area').val();
        var initialDate = $scope.initialDateI;
		//$('#report-cycletime-line-InitialDate').datepicker('getFormattedDate');
        var finalDate = $scope.finalDateI;
		//$('#report-cycletime-line-FinalDate').datepicker('getFormattedDate');

        var onSuccessLoadShopOrders = function (response) {

            console.log("Fired onSuccessLoadShopOrders");

            var data = response.data;
            
            if(angular.isArray(data) === false){
                var msg = "Não foi possível carregar as ShopOrders. \r\n" + data;
                console.error(msg);
                alert(msg);
                return;
            }

            var options = new Array();

            for (var i = 0; i < data.length; i++) {
                if (data[i] == "")
                    continue;
                var option = {label: data[i], title: data[i], value: data[i]};
                options.push(option);
            }

            $('#report-cycletime-line-SO').multiselect('dataprovider', options);
        };

        var onFailLoadShopOrders = function (response) {
            console.log("Fired onFailLoadShopOrders");
            alert("Falhou ao buscar os valores de ShopOrders para o combobox.");
        };

        var onSuccessLoadFamilies = function (response) {

            console.log("Fired onSuccessLoadFamilies");

            var data = response.data;
            
            if(angular.isArray(data) === false){
                var msg = "Não foi possível carregar as Famílias. \r\n" + data;
                console.error(msg);
                alert(msg);
                return;
            }

            var options = new Array();

            for (var i = 0; i < data.length; i++) {
                if (data[i] == "")
                    continue;
                var option = {label: data[i], title: data[i], value: data[i]};
                options.push(option);
            }

            $('#report-cycletime-line-Family').multiselect('dataprovider', options);
        };

        var onFailLoadFamilies = function (response) {
            console.log("Fired onFailLoadFamilies");
            alert("Falhou ao buscar os valores de ShopOrders para o combobox.");
        };

        var onSuccessLoadWorkStations = function (response) {

            console.log("Fired onSuccessLoadWorkStations");

            var data = response.data;
            
            if(angular.isArray(data) === false){
                var msg = "Não foi possível carregar as WorkStations. \r\n" + data;
                console.error(msg);
                alert(msg);
                return;
            }

            var options = new Array();

            for (var i = 0; i < data.length; i++) {
                if (data[i].column1 == "" || data[i].column2 == "")
                    continue;
                var option = {label: data[i].column2, title: data[i].column2, value: data[i].column1, selected: true};
                options.push(option);
            }

            $('#report-cycletime-line-WS').multiselect('dataprovider', options);
        };

        var onFailLoadWorkStations = function (response) {
            console.log("Fired onFailLoadWorkStations");
            alert("Falhou ao buscar os valores de WorkStations para o combobox.");
        };

        var urlWS = portsAPI.getReportsAPI() + "/CycleTime/GetWorkStationsByArea?idArea=" + selectedArea;
        var urlSO = portsAPI.getReportsAPI() + "/CycleTime/GetShopOrdersByArea?initialDate=" + initialDate + "&finalDate=" + finalDate + "&idArea=" + selectedArea;
        var urlFamily = portsAPI.getReportsAPI() + "/CycleTime/GetFamiliesByArea?initialDate=" + initialDate + "&finalDate=" + finalDate + "&idArea=" + selectedArea;

        console.log("URL WS: " + urlWS);
        console.log("URL SO: " + urlSO);
        console.log("URL Family: " + urlFamily);

        $http.get(urlWS, {timeout: 8640000}).then(onSuccessLoadWorkStations, onFailLoadWorkStations);
        $http.get(urlSO, {timeout: 8640000}).then(onSuccessLoadShopOrders, onFailLoadShopOrders);
        $http.get(urlFamily, {timeout: 8640000}).then(onSuccessLoadFamilies, onFailLoadFamilies);
    };

    // Initialiezes calendar objects
    initializeFrontObjects();

    startWithPing();
});