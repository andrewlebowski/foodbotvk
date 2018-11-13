const axios = require('axios')
const qs  = require('querystring')

var searchOrganisation = async function(organisation, location){
    var codingOrg = qs.escape(organisation)
    var request = `https://search-maps.yandex.ru/v1/?text=${codingOrg}&ll=${location}&results=100&lang=ru_RU&apikey=${process.env.YANDEXTOKEN}`
    var result = []
    try { 
        var response = await axios.get(request)
    } catch(error){
        console.log(error)
    }
    for(var i = 0; i < response.data.features.length; i++){
        if(response.data.features[i].properties.CompanyMetaData.Hours != undefined){
            if(response.data.features[i].properties.CompanyMetaData.Hours.State.is_open_now == '1'){
                var obj = {
                    name : response.data.features[i].properties.CompanyMetaData.name,
                    address : response.data.features[i].properties.CompanyMetaData.address,
                    time : response.data.features[i].properties.CompanyMetaData.Hours.text,
                    state : response.data.features[i].properties.CompanyMetaData.Hours.State.text,
                    geo : response.data.features[i].geometry.coordinates
                }
                result.push(obj)
            }
        }
    }
    return result
}


module.exports = searchOrganisation