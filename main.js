"use strict";
// http://api.aladhan.com/v1/timingsByCity/



// selects and button
const countrySelect = document.querySelector("main .input #country");
const citySelect = document.querySelector("main .input #city");
const methodSlecet = document.querySelector("main .input #method");
const prayersBtn = document.querySelector("main .input button");

// functions
function getCities(country) {
  return country["cities"].map(function (element) {
    return element["name"];
  })
}
function getHijri(data) {
  const hijri = data.data.date.hijri;
  return `${hijri.day}/${hijri.month.en}/${hijri.year}`
}
function getGregorian(data) {
  const x = data.data.date.gregorian;
  return ` ${x.weekday.en} ${x.day}/${x.month.en}/${x.year}`

}

async function getPrayers(country,city,method) {
    let data =
    await fetch(`http://api.aladhan.com/v1/timingsByCity?country=${country}&city=${city}&method=${method}`);
    let jsonData = await data.json();
    return jsonData;
}

// methods select
const Methods = {
  "Shia Ithna-Ansari":0,
  "University of Islamic Sciences, Karachi":1,
  "Islamic Society of North America" : 2,
  "Muslim World League": 3,
  "Umm Al-Qura University, Makkah" : 4,
  "Egyptian General Authority of Survey":5,
  "Institute of Geophysics, University of Tehran":7,
  "Gulf Region":8,
  "Kuwait" : 9,
  "Qatar": 10,
  "Majlis Ugama Islam Singapura, Singapore":11,
  "Union Organization islamic de France":12,
  "Diyanet İşleri Başkanlığı, Turkey":13,
  "Spiritual Administration of Muslims of Russia":14,
  "Moonsighting Committee Worldwide":15,
  "Dubai":16
}
for (const key in Methods) {
  let option = document.createElement("option");
  option.append(key);
  option.value = Methods[key];
  methodSlecet.append(option)
}

fetch(`countries+cities.json`)
  .then(response => response.json())
  .then(data => {
    
    for (let index = 0; index < data.length; index++) {
      let country = data[index];
      let option = document.createElement("option");
      option.setAttribute("value", index);
      option.append(country.name);
      countrySelect.append(option)
    }

    countrySelect.onchange = function (){
      citySelect.innerHTML = "";
      const country = this.value;
      const cities = getCities(data[country]);
      for (let index = 0; index < cities.length; index++) {
        const element = cities[index];
        const option = document.createElement("option");
        option.value = index;
        option.append(element);
        citySelect.append(option);
        
      }
    }
    
    return data;
  })
  .catch(error => {
    console.error('An error occurred while fetching data:', error);
  })
  .then(data => {
    
  });

prayersBtn.onclick = function () {
  try {
    const country = countrySelect.options[countrySelect.value].text;
    const city = citySelect.options[citySelect.value].text;
    localStorage.country = country;
    localStorage.city = city;
    localStorage.method = methodSlecet.value;
  } catch (error) {
    return;
  }
  
  const prayers = getPrayers(
    country,city,
    methodSlecet.value);
  prayers.then(data => {
      if (data.code === 200 && data.status.toLowerCase() === "ok") {
        
        return [data.data.timings,getHijri(data),getGregorian(data)];
      }
      
  }).then(data=>{
      let [timings,hijri,gregorian] = data;
      let resultDiv = document.getElementById("result");
      let pLast = resultDiv.querySelector("p"),tableLast = resultDiv.querySelector("table");
      if (pLast && tableLast) {
        pLast.remove();
        tableLast.remove();
      }
      let p = document.createElement("p");
      p.append(hijri + gregorian);
      resultDiv.append(p);
      let table = document.createElement("table");
      let firstR = document.createElement("tr");
      let prayer  = document.createElement("th");
      let time = document.createElement("th");
      prayer.append("Prayer");
      time.append("Time");
      firstR.append(prayer,time);
      table.append(firstR);
      for (const key in timings) {
        if (Object.hasOwnProperty.call(timings, key)) {
          const element = timings[key];
          let tr = document.createElement("tr");
          let tdPrayer = document.createElement("td");
          let tdTime = document.createElement("td");
          tdPrayer.append(key);
          tdTime.append(element);
          tr.append(tdPrayer,tdTime);
          table.append(tr);

        }
      }
    resultDiv.append(table);
    document.querySelector("footer").scrollIntoView();
  })
}
window.onload = function () {
  countrySelect.onchange()
}