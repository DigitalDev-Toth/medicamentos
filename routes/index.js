import Joi from 'joi';

import Medicine         from './medicine';

// API
import APIPatients      from './api/patients';
import APIMedicines     from './api/medicines';

const Index = {
    method: ['GET'],
    path: '/prescription/{dni?}',
    config: { 
        auth: false,
        handler: function(request, reply) {
            let dni = encodeURIComponent(request.params.dni);

            if (dni != 'undefined' ) {
                let select = `
                SELECT
                    data
                FROM
                    medicamentos
                WHERE 
                    data ->> 'resourceType' = 'Patient'
                AND
                    data ->> 'dni' = '${dni}';`;

                request.pg.client.query(select, function(err, result) {
                    if (err) throw err
                    
                    
                    if(result.rows[0]) {
                        console.log(result.rows[0].data)
                        reply.view('index', { patient: result.rows[0].data.dni });
                    } else {
                        reply.view('index', { patientError: 'noExist' });
                    }
                });
            } else {
                return reply.view('index', { patientError: 'noSended' });
            }             
        }
    }
};

const Public = {
    method: "GET",
    path: "/medication/public/{path*}",
    config: { auth: false },
        handler: {
            directory: {
                path: "./public",
                listing: false,
                index: false
            }
        }
};

const Routes = [].concat(
    Public,
    Index,
    Medicine,
    APIPatients,
    APIMedicines
);

export default Routes;