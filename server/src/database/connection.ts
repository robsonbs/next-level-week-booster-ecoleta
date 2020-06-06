import knex from 'knex';

const knexConfig = require('../../knexfile').development;

const connection = knex(knexConfig);

export default connection;
