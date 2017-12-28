import Joi from 'joi';
import moment from 'moment';

const prescriptions = [
{
    method: 'POST',
    path: '/medication/api/prescriptions',
    config: {
        handler: (request, reply) => {
            let patient = request.payload.patient;

            let select = `
            SELECT
                data
            FROM
                medicamentos
            WHERE 
                data ->> 'resourceType' = 'Prescription'
            AND 
                data ->> 'patient' = '${patient}'
            AND
                data ->> 'endDay' > '${moment().format("YYYY-MM-DD")}';
            `;
            
            request.pg.client.query(select, function(err, result) {
                if (err) throw err
                
                return reply(result.rows);
            });
            
            
        },
        validate: {
            payload: Joi.object().keys({
                patient: Joi.string()
            })
        }
    }
},
{
    method: 'POST',
    path: '/medication/api/historyPrescriptions',
    config: {
        handler: (request, reply) => {
            let patient = request.payload.patient;

            let select = `
            SELECT
                data
            FROM
                medicamentos
            WHERE 
                data ->> 'resourceType' = 'Prescription'
            AND 
                data ->> 'patient' = '${patient}'
            AND
                data ->> 'endDay' < '${moment().format("YYYY-MM-DD")}';
            `;
            
            request.pg.client.query(select, function(err, result) {
                if (err) throw err
                
                return reply(result.rows);
            });
            
            
        },
        validate: {
            payload: Joi.object().keys({
                patient: Joi.string()
            })
        }
    }
},
{
    method: 'POST',
    path: '/medication/api/prescription/new',
    config: {
        handler: (request, reply) => {
            let prArr = request.payload.arr; // arreglo de nuevas prescripciones
            let toJson = JSON.parse(prArr);
            let usuarioDePrueba = '321321321';
            let concatQuery = '';

            toJson.forEach(element => {
                element.resourceType = 'Prescription';
                element.byUser = usuarioDePrueba;
                concatQuery += `INSERT INTO medicamentos (id, data) VALUES (default, '${JSON.stringify(element)}') RETURNING id;`;
            });
            
            request.pg.client.query(concatQuery, function(err, result) {
                if (err) throw err
                
                console.log(result)
                if (result.length > 0) {
                    let rows = []
                    result.forEach(element => {
                        console.log(element)
                        rows.push(element.rows[0].id);
                    });
                    
                    return reply(rows);
                } else {
                    return reply({error: 'No se han agregado las nuevas prescripciones'});
                }

                
            });
            
            
        },
        validate: {
            payload: Joi.object().keys({
                arr: Joi.string()
            })
        }
    }
}
];

export default prescriptions;