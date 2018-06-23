//make fields author,filesize,date
function Project(id,name,description,site,author,filesize,date) 
{
  this.$id = id;
  this.name = name;
  this.description = description;
  this.site = site;
  //setting the value in Project from the data in parameters.
  this.author = author;
  this.filesize = filesize;
  this.date = date;
}

//Crete a CartItem constructor for setting data inside cart.
function CartItem(id,name,description,hlink,author,filesize,date) 
{
  this.$id = id;
  this.name = name;
  this.description = description;
  this.hlink = hlink;
  this.author = author;
  this.filesize = filesize;
  this.date = date;
}


function Projects() 
{
// create array CartProjects to save CartIteam objects.	
  CartProjects = [];
  this.CartProjects = CartProjects;

// develop cartadd function to add CartIteam objects in CartProjects. 
  this.Cartadd = function(prj) {
    CartProjects.splice(CartProjects.length,0,prj);
  }

// develop CartRemove function to remove CartIteam objects in CartProjects on the basis
// Id parameter. 
  this.CartRemove = function(id)
  {
	for(var i=0;i<CartProjects.length;i++) {
      if(CartProjects[i].$id == id) {
        CartProjects.splice(i,1);
        return;
      }
    }
  }
  
  projects = [];
  this.projects = projects;
  this.loaded = 0;
  
  this.add = function(prj) {
    projects.splice(projects.length,0,prj);
  }
  
  
  this.get = function(id) {
    for(var i=0;i<projects.length;i++) {
      var prj = projects[i];
      if(prj.$id == id)
        return prj;
    }
  }

  this.remove = function(id) {
    for(var i=0;i<projects.length;i++) {
      if(projects[i].$id == id) {
        projects.splice(i,1);
        return;
      }
    }
  }

  this.update = function(itemOrId) {
    alert(itemOrId);
  }
}

angular.projects = new Projects();

angular.module('project',[]).
  factory('Projects', function() {
    return angular.projects;
  }).
  
  //develop 'CartSize' factory for 'size' global variable to
  //store the count of size when the project is added , removed from
  //the cart.
  factory('CartSize', function() {
    return {
		size : 0,
	};
  }).
  
  factory('CartLength',function(){
	 return{
		 Length : 0, 
	   } 
	}).
  config(function($routeProvider) {
    $routeProvider.
    when('/', {controller:ListCtrl, templateUrl:'list.html'}).
    when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
    when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
	
	//create a route , controller for the Showing and calculating Cart's
	//data on Chart
	when('/chart', {controller:GenerateChart, templateUrl:'chart.html'}).
    otherwise({redirectTo:'/'});
  })
  
  //develop custom directives for drag and drop functionality
  .directive('draggable', function() {
  return function(scope, element) {
    // this gives us the native JS object
    var el = element[0];
    
    el.draggable = true;
    
    el.addEventListener(
      'dragstart',
      function(e) {
        //tr.style.backgroundColor = "red";
		e.target.style.opacity = .4;
		//e.target.style.border = "4px dotted green";
          
	    e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('Text', this.id);
        
		this.classList.add('drag');
        return false;
      },
      false
    );
    
    el.addEventListener(
      'dragend',
      function(e) {
     
		this.classList.remove('drag');
        e.target.style.opacity = 1;
		return false;
      },
      false
    );
	
  }
}).directive('droppable', function() {
	return {
      restrict: 'AE',
      scope:{
  			onLoadCallback: '&'
  		},
    link: function(scope, element) {
      // again we need the native object
      var el = element[0];
      
      el.addEventListener(
        'dragover',
        function(e) {
          event.target.style.opacity = .1;
     
   		  e.dataTransfer.dropEffect = 'move';
          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'dragenter',
        function(e) {
          
		  event.target.style.opacity = .1;
      
		  
		  this.classList.add('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'dragleave',
        function(e) {
          event.target.style.opacity = 1;
          
		  this.classList.remove('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
	    'drop',
        function(e) {
			// Stops some browsers from redirecting.
          event.target.style.opacity = 1;
          
		  
		  if (e.stopPropagation) e.stopPropagation();
          this.classList.remove('over');
          var br = document.createElement("br");
   		  var item = document.getElementById(e.dataTransfer.getData('Text'));
		  
		  var filesize = item.cells[3].innerText;
		  var filename = item.cells[0].innerText;
		  
		  item.remove();
		  
		  //returning selected project Id, FileSize and fileName back to the onLoadCallback
          //attribute , which is using this data to parameterise the function call in the Controller. 		  
		  scope.onLoadCallback({id:e.dataTransfer.getData('Text'),size:filesize, name:filename});
		 
		  return false;
        },
        false
      );
    }
  }
});
	
	
function ListCtrl($scope, $http, Projects, $location, CartSize, CartLength) {
  $scope.field = 'name';   //First load show sorting on Name Column.
  $scope.reverse = false;   //First load show sorting in Increment order.
  $scope.size = CartSize.size; //defining total filesize in the cart as 'size' to the global 'CartSize.size' 
  $scope.increment = true;
  $scope.randomfield ='random';
  $scope.cartLength = CartLength.Length;	  
  $scope.count=0;           //count maintains cycle, that is when it is 0 -> 
                            //Increment Sort , 1 -> Decrement Sort , 2->Random Sort.
  
  //order function do the calculation of cycle number and set the type of 
  //sorting values , cycle number , field value in the variables accordingly.
  $scope.order = function(field)
  {
	  $scope.noorder = false;
	  
	  $scope.count = ($scope.field != field || $scope.count > 1) ? 0 : $scope.count = $scope.count+1 ;
	  $scope.field = field;
	  $scope.reverse = ($scope.count === 0)? false : true; 
	  $scope.randomfield = ($scope.count === 2)? $scope.field: 'random';
	  $scope.field = ($scope.count === 2)? 'random' : $scope.field;
	  $scope.reverse = ($scope.count === 2)? false : $scope.reverse;
      $scope.noorder = ($scope.count === 2)?true : false;
	  $scope.increment = ($scope.count ===0)?true : false;
  };
  
  //destroy function is built to remove the Project object present in the projects array
  //it is called form the List view's delete image click button.
    $scope.destroy = function(id) {
	 Projects.remove(id);
      $location.path('/');
   };
   
   //CartCreate function is developed to Create new object of CartItem's constructor
   //and set it in the CartProjects array, which will be used to get data inside cart.
   //Also, this function removes the same id's Project object from the projects array inside projects class.
   //so, that we can load the remainig projects after the project is set in the cart.
   //this function also calculates (adds) and set the value of CartSize.size and set it again to
   //the scope variable size.   
    $scope.CartCreate = function(id,projectsize,name) {
      var site = Projects.get(id).site;
	  var desc = Projects.get(id).description;
	  var author = Projects.get(id).author;
	  var date = Projects.get(id).date;
	  
      Projects.remove(id);
	  CartLength.Length++;
	  $scope.cartLength = CartLength.Length;	
	  CartSize.size=CartSize.size + parseInt(projectsize);
      $scope.size = CartSize.size;
        
	  Projects.Cartadd(new CartItem(id,name,desc,site,author,projectsize,date));
      $scope.$apply()     
	  $location.path('/');
     
  };
  
  
  
   //CartDestroy function is developed to delete object of CartItem's from  
   //the CartProjects array in Projects class, which will be used to get current data inside cart.
   //Also, this function add the same id's Project object into the projects array inside projects class.
   //so, that we can load the remainig projects after the project is set or removed from the cart.
   //this function also calculates (subtracts) and set the value of CartSize.size and set it again to
   //the scope variable size. 
	$scope.CartDestroy = function(id,name,desc,site,author,projectsize,date) {
      Projects.add(new Project(id,name,desc,site,author,projectsize,date));
      Projects.CartRemove(id);
      
	  CartLength.Length--;
	  $scope.cartLength = CartLength.Length;
	  CartSize.size=CartSize.size - parseInt(projectsize);
      $scope.size = CartSize.size;
      
	  };
  
   if(Projects.loaded == 0) {
    $http.get("projects.json").success(function(data) {
      for(var i = 0;i<data.length;i++) {
        var itm = data[i];
        Projects.add(new Project(itm.$id,itm.name,itm.description,itm.site,itm.author,itm.filesize,itm.date));
      }
    });
    Projects.loaded = 1;
  }
$scope.projects = Projects;
}

//GenerateChart function is used to connect with the Projects class projects array
//to calculate each object's name and filesize and setting it to the FusionCharts object, 
//to create charts of only the objects present in our projects array.
function GenerateChart($scope, Projects)
{
var data_array = []; 
 
 var count = Projects.projects.length;
            for(var i=0;i<count;i++)
            {
                var obj = {
                    label : Projects.projects[i].name,
                    value : Projects.projects[i].filesize,
                }
                data_array.push(obj);
            }
 
 
 var newdata=  {
    "chart":{
        "bgcolor":"ffffff",
        "xAxisName":"Projects","yAxisName":"File Size",
        "formatnumber":"1",
        "formatnumberscale":"6",
        "sformatnumber":"1",
        "showplotborder":"0",
        "canvasborderalpha":"0",
        "theme":"zune"
            },
    "data": (data_array)
};
    
    var AnalysisChart = new FusionCharts({
        type: 'column2d',
        renderAt: 'divChartAnalysis',
        width: '100%',
        height: '250',
        dataFormat: 'json',
        dataSource: newdata
 
    });
    AnalysisChart.render();
 
 } 
     

	 
function CreateCtrl($scope, $location, $timeout, Projects) {
  $scope.project = new Project();
  
  var today=new Date();
  $scope.today = today.toISOString();
  
  $scope.save = function() {
    $scope.project.$id = randomString(5,"abcdefghijklmnopqrstuvwxyz0123456789");
    Projects.add(angular.copy($scope.project));
    $location.path('/');
  }

}

function EditCtrl($scope, $location, $routeParams, Projects) {
   $scope.project = angular.copy(Projects.get($routeParams.projectId));
   $scope.isClean = function() {
      return angular.equals(Projects.get($routeParams.projectId), $scope.project);
   }
   $scope.destroy = function() {
      Projects.remove($routeParams.projectId);
      $location.path('/');
   };
   $scope.save = function() {
      var prj = Projects.get($routeParams.projectId);
      prj.name = $scope.project.name;
      prj.description = $scope.project.description;
	  
	  //need to save newly created attributes , created prj.author, prj.filesize, 
	  //prj.date here in save function.	  prj.author = $scope.project.author;
	  prj.filesize = $scope.project.filesize;
	  prj.date = $scope.project.date;
      prj.site = $scope.project.site;
      $location.path('/');
   };
}

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) 
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

function isNumber(evt) {
	evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
	if ((charCode > 31 && (charCode < 48 || charCode > 57)) || charCode == 16) {
        return false;
    }
    return true;
};

function onlyAlphabets(event){
        var inputValue = event.charCode;
        if(((inputValue > 47 && inputValue < 58) && (inputValue != 32)) || (inputValue > 32 && inputValue < 48)){
            return false;
        }
		return true;
    };
	
	
function checkdate(){
	var date = document.myForm.StartDate.value;
	var year = date.split('-')[0];
    var d = new Date();	
	var today= [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
	alert("hello");
	if(year < 2000)
	{
     alert('date should not be less than 01-01-2000');	
	 return true;
	}
   else if(date > today)
   {
    alert('date should not be greater than Today');	
	return true;
   }
};


function addChild()
{
   document.getElementById("cart-add").classList.remove("close-cart");
   };	


function remChild(event)
{
  if (event.ctrlKey)
	  document.getElementById("cart-add").classList.remove("close-cart");
   else	  
	  document.getElementById("cart-add").classList.add("close-cart");
};