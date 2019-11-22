'use strict';

angular.module("cummins-supervisorio").controller("statisticsReportCtrl", function ($scope, $http, $sce, reportUtilsService, portsAPI) {

  /**
   * Model object shared among view and controller
   */
  $scope.modelObj = {};

  /**
   * Array of WorkStations to fill the combobox
   */
  $scope.WorkStationsList = new Array();

  /**
   * Shows the report content returned by backend
   * @param {type} content
   * @returns {undefined}
   */
  var showReportContent = function (content) {
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
    
    $('.datepicker#report-statistics-InitialDate').datepicker('update', '');
    $('.datepicker#report-statistics-FinalDate').datepicker('update', '');
    
    if($scope.WorkStationsList.length > 0){
       $('#report-statistics-WS').multiselect('deselectAll', false);
       //$('#report-statistics-WS').multiselect('select', $scope.WorkStationsList[0].value);
       $('#report-statistics-WS').multiselect('refresh');
    }
    
    $('#report-statistics-SO').multiselect('deselectAll', false);
    $('#report-statistics-SO').multiselect('refresh');
    
    $('#report-statistics-Family').multiselect('deselectAll', false);
    $('#report-statistics-Family').multiselect('refresh');

    showReportContent("<p>No content yet.</p>");
  };

  /**
   * Generates the report
   * @returns {undefined}
   */
  $scope.generateReport = function () {
    console.log("Fired generateReport");
    
    var reportContent = "<label class='text-primary' style='font-size: 1.5em;'><span class='glyphicon glyphicon-time' aria-hidden='true'></span> Aguarde...</labe1>";
    showReportContent(reportContent);
    
    if ($scope.modelObj == null)
      $scope.modelObj = {};

    // Get calendar's values
    $scope.modelObj.InitialDate = $scope.initialDateI;
	//Validação estranha $('#report-statistics-InitialDate').datepicker('getFormattedDate');
    $scope.modelObj.FinalDate = $scope.finalDateI;
	//Validação estranha $('#report-statistics-FinalDate').datepicker('getFormattedDate');
	console.log("Data inicial"+$scope.initialDate);
	console.log("Data inicial"+$scope.finalDate);
	console.log("Data inicial"+$scope.modelObj.InitialDate);
	console.log("Data inicial"+$scope.modelObj.FinalDate);
    // Get combos' values
    $scope.modelObj.WS = $('#report-statistics-WS').val();
    
    $scope.modelObj.SO = $('#report-statistics-SO').val();
    $scope.modelObj.Family = $('#report-statistics-Family').val();

    var queryParameters = reportUtilsService.generateQueryParametersFromModelObject($scope.modelObj);

    var url = portsAPI.getReportsAPI() + "/Statistics/Indicadores" + queryParameters;

    console.info("Report URL: " + url);

    var onSuccessGetReport = function (response) {
      console.log("Fired onSuccessGetReport");
      var reportContent = reportUtilsService.injectReportAPIUrlOnReportViewerResult(response.data);
      showReportContent(reportContent);
    };

    var onFailGetReport = function (response) {
        if(response.status === 403){
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
   * Load avalable WorkStations
   * @returns {undefined}
   */
  var loadAvalableWorkStations = function () {

    var onSuccessLoadAvalableWorkStations = function (response) {

      console.log("Fired onSuccessLoadAvalableWorkStations");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
          
        if(data[i].column1 == "" || data[i].column2 == "") continue;
          
        var option = {label: data[i].column2, title: data[i].column2, value: data[i].column1};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-statistics-WS').multiselect('dataprovider', options);
    };

    var onFailLoadAvalableWorkStations = function (response) {
      console.log(response);
      console.log("Fired onFailLoadAvalableWorkStations");
      alert("Falhou ao buscar os valores de Workstations para o combobox.");
    };

    var url = portsAPI.getReportsAPI() + "/Statistics/GetWorkStations";

    console.log("URL WS: " + url);

    $http({method: 'GET', url: url, timeout: 8640000}).then(onSuccessLoadAvalableWorkStations, onFailLoadAvalableWorkStations);
  };
  
     /**
   * Do a Ping on server
   * If the response is ok,
   * do other requests
   * @returns {undefined}
   */
    var startWithPing = function () {

    var onSuccess = function (response) {
      loadAvalableWorkStations();
    };

    var onFail = function (response) {
      // Falhou miseravelmente ao comunicar-se com o servidor
      // Um mensagem de erro será exibida pelo angular para informar
      // o usuário.
    };

    var url = portsAPI.getReportsAPI() + "/Ping/AreYouThere";

    console.log("URL Ping: " + url);

    $http({method: 'GET', url: url, timeout: 8640000}).then(onSuccess, onFail);
  };

  /**
   * This method clears the values on comboboxes
   * @returns {undefined}
   */
  var clearShopOrderAndFamilyFields = function () {
    console.log("Fired clearShopOrderAndFamilyFields");

    $('#report-statistics-SO').multiselect('deselectAll', false);
    $('#report-statistics-SO').multiselect('refresh');
    $('#report-statistics-SO').multiselect('disable');

    $('#report-statistics-Family').multiselect('deselectAll', false);
    $('#report-statistics-Family').multiselect('refresh');
    $('#report-statistics-Family').multiselect('disable');
  };

  /**
   * Initializes the calendar objects
   * @returns {undefined}
   */
  var initializeFrontObjects = function ()
  {
    // Calendar Initial Date
    $('.datepicker#report-statistics-InitialDate').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });
    
    // Calendar Inital Date calls when his date changes
    $('.datepicker#report-statistics-InitialDate').datepicker().on("changeDate", function (e) {
      clearShopOrderAndFamilyFields();
    });

    console.log("Inicializou InitialDate");

    // Calendar Final Date
    $('.datepicker#report-statistics-FinalDate').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });
    
    // Calendar Final Date calls when his date changes
    $('.datepicker#report-statistics-FinalDate').datepicker().on("changeDate", function (e) {
      clearShopOrderAndFamilyFields();
    });

    console.log("Inicializou FinalDate");

    // Select combo WS
    $('#report-statistics-WS').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200,
      onChange: function(option, checked, select) {
                clearShopOrderAndFamilyFields();
            }
    });
    
    console.log("Inicializou WS select");

    // Select combo SO
    $('#report-statistics-SO').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    console.log("Inicializou SO select");

    // Select combo Family
    $('#report-statistics-Family').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    console.log("Inicializou Family select");
  };

  /**
   * Loads Shop Orders and Families
   * @returns {undefined}
   */
  $scope.loadShopOrdersAndFamilies = function () {

    var selectedWS = $('#report-statistics-WS').val();
    var initialDate = $scope.initialDateI;
	//$('#report-statistics-InitialDate').datepicker('getFormattedDate');
    var finalDate = $scope.finalDateI;
	//$('#report-statistics-FinalDate').datepicker('getFormattedDate');
    
    if(initialDate == null || initialDate === ""){
      alert("Selecione a Data Inicial");
      return;
    }
    
    if(finalDate == null || finalDate === ""){
      alert("Selecione a Data Final");
      return;
    }    
    
    if(selectedWS == null){
      alert("Selecione a WorkStation");
      return;
    }
    
    console.log("Selected WS: " + selectedWS);

    var onSuccessLoadShopOrders = function (response) {

      console.log("Fired onSuccessLoadShopOrders");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
          
        if(data[i] == "") continue;
          
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }

      $('#report-statistics-SO').multiselect('dataprovider', options);
    };

    var onFailLoadShopOrders = function (response) {
      console.log("Fired onFailLoadShopOrders");
      alert("Falhou ao buscar os valores de ShopOrders para o combobox.");
    };

    var onSuccessLoadFamilies = function (response) {

      console.log("Fired onSuccessLoadFamilies");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        
        if(data[i] == "") continue;
          
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }

      $('#report-statistics-Family').multiselect('dataprovider', options);
    };

    var onFailLoadFamilies = function (response) {
      console.log("Fired onFailLoadFamilies");
      alert("Falhou ao buscar os valores de ShopOrders para o combobox.");
    };

    var urlSO = portsAPI.getReportsAPI() + "/Statistics/GetShopOrders?initialDate="+initialDate+"&finalDate="+finalDate+"&workStationsList=" + selectedWS;
    var urlFamily = portsAPI.getReportsAPI() + "/Statistics/GetFamilies?initialDate="+initialDate+"&finalDate="+finalDate+"&workStationsList=" + selectedWS;

    console.log("URL SO: " + urlSO);
    console.log("URL Family: " + urlFamily);

    $http({method: 'GET', url: urlSO, timeout: 8640000}).then(onSuccessLoadShopOrders, onFailLoadShopOrders);
    $http({method: 'GET', url: urlFamily, timeout: 8640000}).then(onSuccessLoadFamilies, onFailLoadFamilies);
  };

  // Initialiezes calendar objects
  initializeFrontObjects();

  startWithPing();
});