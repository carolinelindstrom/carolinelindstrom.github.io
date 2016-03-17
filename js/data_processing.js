"use strict";
/**
 * Converts every row in the csv file into an alumn object with attributes for
 * every column.
 * @param  {object} row with 'Land,Organisation,Befattning,Utbildning,Examensår'
 * @return {Alumn}      an alumn object.
 */
function rowToObject(row){
  return new Alumn(row['Country'], row['Company'], row['Profession'], row['Education'], row['Graduation_year']);
}

/**
 * A function that creates a nested tree object grouping after a list of levels.
 * the depth of the three is nestingLevels.length(). If the list is empty the
 * data is returned unchanged.
 * @param  {[Alumn]} data          an array of Alumni
 * @param  {[String]} nestingLevels hierarchy levels from highes to lowest.
 * @return {[Alumn]}                a tree with Alumni as leaves
 */
function nestAsData(data, nestingLevels) {
  //Declare Nesting function
  var nester = d3.nest();
  //For every level in nestingLevels nest one level
  nestingLevels.forEach(function(level) {
    nester = nester.key((d) => d[level]);
  });
  //Feed data to the nesting function.
  return nester.entries(data);
}

// function nestAsMap(data, nestingLevels) {} // Not yet implemented

/**
 * Filters a list of alumni after a set of given criteria. If fields is longer
 * than values then the exheeding values will be used to nest the returned data.
 *
 * @param  {[Alumn]}  data    an array of Alumni
 * @param  {[String]} fields  what fields are of interest
 * @param  {[String]} values  what value the alumni should have at the field
 *                            with the same index.
 * @return {[type]}           an array of Alumni that match the given criteria.
 */
function matchAsData(data, fields, values) {
  data = nestAsData(data, fields);
  if(typeof values !== 'undefined'){
    var newData = [];
    values.forEach(function(value) {
      data.filter(function(d){
        if(d.key == value){
          newData.push(d);
        }
      })
    });
    return newData[0].values;
  };
  return data;
}

/**
 * Filters a list of alumni after a set of given criteria. If fields is longer
 * than values then the exheeding values will be used to nest the returned data.
 *
 * @param  {[Alumn]}  data    an array of Alumni
 * @param  {[String]} fields  what fields are of interest
 * @param  {[String]} values  what value the alumni should have at the field
 *                            with the same index.
 * @return {[type]}           an array of Alumni that match the given criteria.
 */
function matchAsData(data, fields, values) {
  data = nestAsData(data, fields);
  if(typeof values !== 'undefined'){
    var newData = [];
    values.forEach(function(value) {
      data.filter(function(d){
        if(d.key == value){
          newData.push(d);
        }
      })
    });
    return newData[0].values;
  };
  return data;
}

/**
 * Creates a list of entries suitable for usage in the donut chart. N.B. Fields
 * should be at least one longer than values for there to be anything to count.
 * @param  {[Alumn]}  data    an array of Alumni
 * @param  {[String]} fields  what fields are of interest. Length N+1.
 * @param  {[String]} values  what value the alumni should have at the field
 *                            Array lenght N.
 * @return {[type]}        [description]
 */
function matchAsEntries(data, fields, values){
  if(fields.length <= values.length) throw "fields.length <= values.length, nothing to count";
  var entries = [];
  matchAsData(data, fields, values)
    .forEach((d)=>entries.push({key:d.key, value:d.values.length}));

  return entries;
}

//data - alumni data
//program - Computer science
//category - company or profession
function filterOnClick(data, program, category){
  if(category == 0){
    category = "Company";
  }
  else if (category == 1) {
    category = "Profession";
  }
  else{
    category = "Skills"
  }
  //Returns all alumni from 1 program
  var filteredData = matchAsData(data, ["Education"], program);
  //Filtrera på proff/company
  var array = {};
  //var arrayCOunter =
  filteredData.forEach(function(sin){
    if (typeof array[ sin[category] ] == 'undefined'){
      array[ sin[category] ] = 1;
    }
    else {
      array[ sin[category] ] = parseInt(array[ sin[category] ]) + 1;
    }
  });

  return array;
}
