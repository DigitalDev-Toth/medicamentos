import Joi from 'joi';

/*
let testPatients = [];

let listIns = ['clinica1', 'clinica2'];

testPatients['clinica1'] = [
    {
        dni: '123123123',
        name: 'denjko',
        lastname: 'lambert',
        age: 45,
        height: 178,
        weight: 75
    },
    {
        dni: '321321321',
        name: 'patricio',
        lastname: 'madrid',
        age: 67,
        height: 171,
        weight: 87
    },
    {
        dni: '554554554',
        name: 'fabian',
        lastname: 'mesias',
        age: 23,
        height: 181,
        weight: 110
    }
]

testPatients['clinica2'] = [ 
    {
        dni: '98765432k',
        name: 'juan',
        lastname: 'perez',
        age: 43,
        height: 190,
        weight: 86
    },
    {
        dni: '11111111k',
        name: 'maria',
        lastname: 'ramirez',
        age: 18,
        height: 167,
        weight: 58
    } 
]
*/

const patients = [
    {
        method: 'POST',
        path: '/medication/api/patient',
        config: {
            handler: (request, reply) => {
                //let ins = request.payload.ins;
                let patient = request.payload.patient;

                let select = `
                SELECT
                    data
                FROM
                    medicamentos
                WHERE 
                    data ->> 'resourceType' = 'Patient'
                AND
                    data ->> 'dni' = '${patient}';`;
    
                request.pg.client.query(select, function(err, result) {
                    if (err) throw err
                    
                    if( result.rows[0]) {
                        return reply(result.rows[0].data);
                    } else {
                        return reply({ error: 'El paciente no existe en el sistema.'});
                    }
                    
                });

                /*
                if ( testPatients[ins] ) {  
                    new Promise(function(resolve, reject) {
                        testPatients[ins].forEach(function(element, i) {
                            
                            if (element.dni == patient) {
                                resolve({ ok: patient })
                            }

                            if ( testPatients[ins].length == i+1 ) {
                                resolve({ error: 'El paciente no existe en el sistema.'})
                            }
                        });
            
                    }).then(function(value) {
                        return reply(value);
                    });
                } else {
                    //return reply(obj);
                    return reply({ error: 'no existe la institución'});
                }
                */

                
            },
            validate: {
                payload: Joi.object().keys({
                    //ins: Joi.string(),
                    patient: Joi.string()
                })
            }
        }
    },
];

export default patients;