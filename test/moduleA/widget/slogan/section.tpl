
<section class="section style_test2 wrap"  class="style_test" id='slogan'>

</section>

{%style%}
  .style_test{
    color: white;
  }
{%/style%}

<%style%>
.style_test2{
    color: black;
  }
<%/style%>

{%script%}
    var a = document.getElementById("slogan");
    var b = document.getElementById(" slogan");

    a.setAttribute( "class"," style_test2" );
    a.setAttribute("id", "slogan");
{%/script%}