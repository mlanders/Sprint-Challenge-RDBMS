const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const knex = require('knex');
const knexConfig = require('./knexfile.js');

const db = knex(knexConfig.development);
const server = express();

server.use(express.json());
server.use(cors());
server.use(helmet());
server.use(morgan('dev'));

server.get('/', (req, res) => {
	res.send('Sanity Check!');
});

server.get('/api/projects', async (req, res) => {
	try {
		const projects = await db('projects');
		res.status(200).json(projects);
	} catch (error) {
		res.status(500).json({
			message: 'Unable to retrieve the projects.',
			error,
		});
	}
});

server.get('/api/projects/:id', async (req, res) => {
	try {
		const projects = await db('projects').where({ id: req.params.id });
		const actions = await db('actions').where({ project_id: req.params.id });
		if (projects.length) {
			const project = projects[0];
			res.status(200).json({ ...project, actions });
		} else {
			res.status(404).json({ message: 'Unable to find that project' });
		}
	} catch (error) {
		res.status(500).json({
			message: 'Unable to retrieve the project.',
			error,
		});
	}
});

server.post('/api/projects', async (req, res) => {
	if (!req.body.name || !req.body.description) {
		return res.status(400).json({
			message: 'Please include a name and description.',
		});
	}
	try {
		const project = await db('projects').insert(req.body);
		if (project) {
			res.status(200).json({ message: 'Project created successfully.', project });
		} else {
			res.status(404).json({ message: 'Project could not be created.' });
		}
	} catch (error) {
		res.status(500).json({
			message: 'Unable to add the project.',
			error,
		});
	}
});

server.delete('/api/projects/:id', async (req, res) => {
	try {
		const project = await db('projects')
			.where({ id: req.params.id })
			.del();
		const actions = await db('actions')
			.where({ project_id: req.params.id })
			.del();
		if (project) {
			res.status(204).json({
				message: 'Project was deleted successfully.',
			});
		} else {
			res.status(404).json({ message: 'Project could not be found.' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error when deleting the project.', error });
	}
});

server.get('/api/actions', async (req, res) => {
	try {
		const actions = await db('actions');
		if (actions.length) {
			res.status(200).json(actions);
		} else {
			res.status(404).json({ message: 'Unable to find any actions.' });
		}
	} catch (error) {
		res.status(500).json({
			message: 'Error retreiving the actions.',
			error,
		});
	}
});

server.post('/api/actions', async (req, res) => {
	if (!req.body.name || !req.body.description || !req.body.notes || !req.body.project_id) {
		return res.status(400).json({
			message: 'Please include a name, description, notes, and project ID.',
		});
	}
	try {
		const action = await db('actions').insert(req.body);
		if (action) {
			res.status(200).json({
				message: 'Action was created.',
				action,
			});
		} else {
			res.status(404).json({ message: 'Unable to add the action.' });
		}
	} catch (error) {
		res.status(500).json({
			message: 'Error adding the action.',
			error,
		});
	}
});

server.delete('/api/actions/:id', async (req, res) => {
	try {
		const actions = await db('actions')
			.where({ id: req.params.id })
			.del();
		if (actions) {
			res.status(200).json({
				message: 'Successfully deleted',
			});
		} else {
			res.status(404).json({ message: 'Unable to find that action.' });
		}
	} catch (error) {
		res.status(500).json({
			message: 'Error deleting the action.',
			error,
		});
	}
});

module.exports = server;
