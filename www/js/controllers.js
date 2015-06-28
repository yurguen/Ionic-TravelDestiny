angular.module('starter.controllers', ['ionic','firebase','ngCordova','ionic.service.core'])

.controller('DashCtrl', function($scope, $firebaseArray, $rootScope) {

  $scope.ref = new Firebase("https://traveldestiny.firebaseio.com");
  $scope.places = $firebaseArray($scope.ref);


  $scope.addItems = function() {
    var place = {'name':'Iphone', 'location': 'Cuzco, Peru', 'photo':'http://i.imgur.com/RAlhr6T.jpg'};
    var place2 = {'name':'Android', 'location': 'Cuzco, Peru', 'photo':'http://i.imgur.com/RAlhr6T.jpg'};
    $scope.places.push(place);
    $scope.places.push(place2);

    $scope.$broadcast('scroll.infiniteScrollComplete')
  }

  $scope.doRefresh = function() {
    var place = {'name':'Iphone', 'location': 'Cuzco, Peru', 'photo':'http://i.imgur.com/RAlhr6T.jpg'};
    var place2 = {'name':'Android', 'location': 'Cuzco, Peru', 'photo':'http://i.imgur.com/RAlhr6T.jpg'};
    $scope.places.push(place);
    $scope.places.push(place2);

    //$scope.$broadcast('scroll.infiniteScrollComplete')
  }
  $scope.remove = function(place) {
    var placeRef = new Firebase("https://traveldestiny.firebaseio.com/"+place.$id).remove();
  }

  //$scope.places = [{'name':'Iphone', 'prices': 78.10, 'img':'http://www.att.com/wireless/iphone/assets/207138-iPhone6-device2.jpg'}, {'name':'Samsung', 'prices': 78.10, 'img': 'http://www.att.com/wireless/iphone/assets/207138-iPhone6-device2.jpg'}] 
})

.controller('DashFormCtrl', function($scope, $firebaseArray, $rootScope, $state, $cordovaCamera, $cordovaGeolocation) {


    $scope.place = {name: '', location: '', content: {description: ''}, height: '',area: '',official_name: '',region: '',photo: '', lat: -17.37, long: -66.15};


      var myLatlng = new google.maps.LatLng(-17.37, -66.15);

      var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map"), mapOptions);


      var marker = new google.maps.Marker({
              position: new google.maps.LatLng(-17.37, -66.15),
              map: map,
              title: "Mi locacion",
              options: { draggable: true }
      });







    var posOptions = {timeout: 10000, enableHighAccuracy: false};

    $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
      console.log(position);
      $scope.place.lat  = position.coords.latitude
      $scope.place.long = position.coords.longitude

      map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
          
      marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

    }, function(err) {
        console.log(err);
    });


    var watchOptions = {
      frequency : 1000,
      timeout : 3000,
      enableHighAccuracy: false // may cause errors if true
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
      null,
      function(err) {
        console.log(err);
      },
      function(position) {
        console.log(position);
        $scope.place.lat  = position.coords.latitude;
        $scope.place.long = position.coords.longitude;

        marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

    });

    google.maps.event.addListener(marker, 'dragend', function() {
        $scope.$apply(function(){
          //Stop listening changes
          watch.clearWatch();
          var pos = marker.getPosition();
          console.log(pos);
          $scope.place.lat  = pos.A;
          $scope.place.long = pos.F;
        });
    });


    //document.addEventListener("deviceready", function () {

    $scope.takePicture = function() {
          var options = {
              quality : 75,
              destinationType : Camera.DestinationType.DATA_URL,
              sourceType : Camera.PictureSourceType.CAMERA,
              allowEdit : true,
              encodingType: Camera.EncodingType.JPEG,
              popoverOptions: CameraPopoverOptions,
              targetWidth: 500,
              targetHeight: 500,
              saveToPhotoAlbum: false
          };
          $cordovaCamera.getPicture(options).then(function(imageData) {
              //syncArray.$add({image: imageData}).then(function() {
              //    alert("Image has been uploaded");
              //});
              console.log(imageData);
              $scope.place.photo = imageData;

          }, function(error) {
              console.error(error);
          });
      }
    //}, false);

    $scope.uploadPlace = function() {
      var placeRef =  $rootScope.reTravelDestiny.push($scope.place);
      var placeId = placeRef.key();
      console.log(placeId);
      console.log($scope.place.name);
      $state.go('tab.dash-detail',{placeId: placeId});
    }
})

.controller('ChatsCtrl', function($scope, Chats, $rootScope, $state, $ionicHistory) {

  if (!$rootScope.userSignedIn()){
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    $state.go('sign-in');
  }
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('DashDetailCtrl', function($scope, $stateParams, $firebaseObject, $ionicSlideBoxDelegate, $firebaseArray) {

  var ref = new Firebase("https://traveldestiny.firebaseio.com/"+$stateParams.placeId);
  var refIma = new Firebase("https://traveldestiny.firebaseio.com/"+$stateParams.placeId+"/place_to_visit");

  $scope.place = $firebaseObject(ref);
  $scope.images = $firebaseObject(refIma);
  //$scope.images = ["http://i.imgur.com/c5fUDQa.jpg",$scope.place.photo,"http://i.imgur.com/RAlhr6T.jpg","http://i.imgur.com/4U70mp7.jpg","http://i.imgur.com/MXtE7rR.jpg", "http://i.imgur.com/rgt7mu9.jpg","http://i.imgur.com/zixgeUM.jpg","http://i.imgur.com/q9Uhg5g.jpg"]
  
  
  $scope.slideVisible = function(index){
    if(  index < $ionicSlideBoxDelegate.currentIndex() -1 
       || index > $ionicSlideBoxDelegate.currentIndex() + 1){
      return false;
    }
    
    return true;
  }
  $scope.place.$loaded().then(function() {
    $scope.loadMap();
  });

  console.log($scope.place);


  $scope.loadMap = function(){

    console.log("Place");
    console.log($scope.place);

    console.log($scope.place.lat);
    console.log($scope.place.long);

    var myLatlng = new google.maps.LatLng($scope.place.lat, $scope.place.long);

    console.log(myLatlng);

    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map1"), mapOptions);

    var marker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.place.lat, $scope.place.long),
            map: map,
            title: $scope.place.name
    });
  }

})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('SignInCtrl', ['$scope', '$rootScope', '$window', '$localstorage' , '$ionicUser', 
  function ($scope, $rootScope, $window, $localstorage, $ionicUser) {
     // check session
     //$rootScope.checkSession();
     $scope.user = {
        email: "",
        password: ""
     };


     $scope.validateUser = function () {
        $rootScope.show('Please wait.. Authenticating');
        var email = this.user.email;
        var password = this.user.password;
        if (!email || !password) {
           $rootScope.notify("Please enter valid credentials");
           return false;
        }
        function authHandler(error, authData) {
          if (error) {
                $rootScope.hide();
                if (error.code == 'INVALID_EMAIL') {
                  $rootScope.notify('Invalid Email Address');
                }
                else if (error.code == 'INVALID_PASSWORD') {
                  $rootScope.notify('Invalid Password');
                }
                else if (error.code == 'INVALID_USER') {
                  $rootScope.notify('Invalid User');
                }
                else {
                  $rootScope.notify('Oops something went wrong. Please try again later');
                }
              }
            else {
              $rootScope.hide();
              console.log(authData);
              $rootScope.token = authData.token;
              $localstorage.set('token', authData.token);
              //console.log($localstorage.get('token', authData.token));
              //console.log($window.localStorage);

              $ionicUser.identify({
                user_id: authData.uid,
                email: email              
              }).then(function() {
                console.log("Success identify User");
              }, function(err) {
                  console.log("Error identify User");
                  console.log(err);
              });;
              $window.location.href = ('#/tabs/dash');
          }
        }
        $rootScope.refirebase.authWithPassword({
          email    : email,
          password : password
        }, authHandler);
     }
  }
])

.controller('SignUpCtrl', [
    '$scope', '$rootScope',  '$window',
    function ($scope, $rootScope, $window) {
      
      $scope.user = {
        email: "",
        password: ""
      };

      $scope.createUser = function () {
 
    var ref = new Firebase("https://traveldestiny.firebaseio.com");


        if (!$scope.user.email || !$scope.user.password) {
          $rootScope.notify("Please enter valid credentials");
          return false;
        }
 
        $rootScope.show('Please wait.. Registering');

        $rootScope.refirebase.createUser($scope.user, function (error, user) {
          if (!error) {
            console.log(user);
            $rootScope.hide();
            $rootScope.refirebase.child("users").child(user.uid).set({
              provider: 'password',
              email: $scope.user.email
            });
            //$rootScope.token = user.token;
            $window.location.href = ('#/');
          }
          else {
            $rootScope.hide();
            if (error.code == 'INVALID_EMAIL') {
              $rootScope.notify('Invalid Email Address');
            }
            else if (error.code == 'EMAIL_TAKEN') {
              $rootScope.notify('Email Address already taken');
            }
            else {
              $rootScope.notify('Oops something went wrong. Please try again later');
            }
          }
        });
      }
    }
  ])


.controller('AccountCtrl', function($scope, $rootScope, $state) {
  if (!$rootScope.userSignedIn()){
    $state.go('sign-in');
  }
  $scope.settings = {
    enableFriends: true
  };
})

.controller('MapCtrl', function($scope, $rootScope, $state) {


})

