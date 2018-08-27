console.log("in evidence.js")

skill.addEventListener('change',(event)=>{
  console.log('in change event')
  console.dir(event)
  console.log(skill.value)

  $.ajax({
  method: "POST",
  url: "/skill",
  data: { skill:skill.value}
  })
  .done(function( data ) {
    console.log("the AJAX call returned")
    console.log(data)
    $("#skillDesc").html(data)
  });


  // now we create an axios call to the server to get the description of the skill
  // and we print it in the description section
})
