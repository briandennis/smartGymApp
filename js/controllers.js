angular.module('starter.controllers', [])
.controller('DashCtrl', function($scope, $state) {

  $scope.gains = "50%";

  $scope.calories = "1259";

  $scope.addWorkout = function() {
    $state.go('tab.newWorkout');
  }

  var WorkoutObject = Parse.Object.extend("workouts");
  var query = new Parse.Query(WorkoutObject);

  query.find({
      success: function(results) {
          var object = results[0];
          $scope.recentWorkout = "Your last workout was " + object.get("type");
      },
      error: function(error) {
          alert("Error: " + error.code + " " + error.message);
      }
  });

})

.controller('NewWorkoutCtrl', function($scope, $state) {

  var id = 0;

  $scope.exercises = [];

  function Exercise(name, reps, weight) {
    this.id = id;
    this.name = name;
    this.reps = reps;
    this.weight = weight;
  }

  $scope.saveWorkout = function() {
    var WorkoutObject = Parse.Object.extend("workouts");
    var workout = new WorkoutObject();
    var date = document.getElementById("date").value;
    workout.set("date", new Date(Date.parse("10-10-2015")));

    var PExercise = Parse.Object.extend("exercise");

    for (var i = 0; i < $scope.exercises.length; i++) {
      if ($scope.exercises[i] !== null) {
        var exercise = new PExercise();

        exercise.set("machine", $scope.exercises[i].name);
        exercise.set("reps", parseInt($scope.exercises[i].reps));
        exercise.set("weight", parseInt($scope.exercises[i].weight));

        exercise.set("parent", workout);
        exercise.save();
      }
    }
  };

$scope.addExercise = function() {
  var es = document.getElementById("exerciseSelect");
  var e = es.options[es.selectedIndex].text;

  var reps = document.getElementById("reps").value;
  var weight = document.getElementById("weight").value;

  var exercise = new Exercise(e, reps, weight);
  $scope.exercises[id] = exercise;
  id++;
};

})

.controller('GraphsCtrl', function($scope) {

  function getObjectById (parseClass, objectId, callback, index){

    if(parseClass && objectId && callback){

      var ParseObject = Parse.Object.extend(parseClass);
      var parseQuery = new Parse.Query(ParseObject);

      parseQuery.get(objectId.toString(),{

        success: function(currObject){
          var objectHolder = JSON.parse(JSON.stringify(currObject));
          objectHolder.index = index;
          callback(objectHolder);
        },

        error: function(error){
          console.log("there was an error");
          return "error";
        }
      });
    }
  }

  //get parse information
  var workoutDates = [];
  var workoutCounts = [];
  var workoutSets = [];
  var weights = [];


  var WorkoutObject = Parse.Object.extend("workouts");
  var query = new Parse.Query(WorkoutObject);

  query.find({
      success: function(results){
        for (var i = 0; i < results.length; i++){
          workoutSets[i] = 0;
          weights[i] = 0;
          var currWorkout = JSON.parse(JSON.stringify(results[i]));
          var workoutDate = new Date(currWorkout.createdAt);
          workoutDates.push((workoutDate.getMonth() + 1) + '/' + workoutDate.getDate());
          workoutCounts.push(currWorkout.exercises.length);

          if(currWorkout.exercises.length > 0){
            for (var k = 0; k < currWorkout.exercises.length; k++){

                getObjectById('exercise',currWorkout.exercises[k].toString(),function(returnObject){
                  workoutSets[returnObject.index] += JSON.parse(JSON.stringify(returnObject)).sets.length;

                  for(var y = 0; y < JSON.parse(JSON.stringify(returnObject)).sets.length; y++){
                    getObjectById('set',JSON.parse(JSON.stringify(returnObject)).sets[y].toString(), function(returnSet){
                        var currSet = JSON.parse(JSON.stringify(returnSet));
                        var weight = currSet.weight;
                        var reps = currSet.reps;
                        weights[currSet.index] += weight*reps;
                        console.log(currSet.index);

                        //form data values
                        $scope.labels = workoutDates;
                        $scope.data = [workoutCounts];
                        $scope.data2 = [workoutSets];
                        $scope.data3 = [weights];
                        $scope.colours = [{
                          fillColor: 'RGBA(251, 89, 89, .6)',
                          strokeColor: 'RGBA(251, 89, 89, 1)',
                          highlightFill: 'RGBA(251, 89, 89, 1)',
                          highlightStroke: 'RGBA(251, 89, 89, 1)'
                        }];

                    },returnObject.index);
                  }
                },i);
            }
          }
        }
      },
      error: function(error) {
          console.log('error');
      }
  });

})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
