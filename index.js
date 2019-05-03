const express = require('express');
const knex = require('knex');

const dbConfig = require('./knexfile');

const server = express();
const db = knex(dbConfig.development);

server.use(express.json());

server.post('/api/projects', (req, res) => {
    const project = req.body;
    if (project.project_name) {
        db('projects').insert(project)
        .then(ids => {
            res.status(201).json(ids)
        })
        .catch(err => {
            res.status(500).json({err: 'Failed to add project.'})
        })
    } else {
        res.status(400).json({ error: 'Please provide project name.' });
    }
})

server.post('/api/actions', (req, res) => {
    const action = req.body;
    if (action.action_description) {
        db('actions').insert(action)
        .then(ids => {
            res.status(201).json(ids)
        })
        .catch(err => {
            res.status(500).json({err: 'Failed to add action.'})
        })
    } else {
        res.status(400).json({ error: 'Please provide action description.' });
    }
})

server.get('/api/projects/:id', (req, res) => {
    const {id} = req.params;
    db('projects').where('id', id)
    .then(project => {
        if (project.length > 0) {
        db('actions').where('project_id', id)
        .then(actions => {
            project = project[0]
            project.actions = actions
            if (project.project_complete === 0) {
                project.project_complete = false;
            } else {
                project.project_complete = true;
            }
            project.actions.forEach((action) => {
                if (action.action_complete === 0) {
                    action.action_complete = false;
                } else {
                    action.action_complete = true;
                }
            })
            res.json(project)
        })} else {
            res.status(404).json({ error: 'No project to display.'})
        }
    })
    .catch(err => {
        res.status(500).json({err: 'Failed to find project'})
    })
})

server.delete('/api/actions/:id', (req,res) => {
    const {id} = req.params;
    db('actions').where('id', id).del()
    .then(count => {
      res.status(200).json({ success: 'Action successfully deleted' })
    })
    .catch(err => {
      res.status(500).json({ error: 'Failed to delete action.' })
    })
  });

  server.delete('/api/projects/:id', (req,res) => {
    const {id} = req.params;
    db('projects').where('id', id).del()
    .then(count => {
        db('actions').where('project_id', id).del()
        .then(count => {
            res.status(200).json({ success: 'Project and associated actions successfully deleted' })
        })
    })
    .catch(err => {
      res.status(500).json({ error: 'Failed to delete project.' })
    })
  });


  server.get('/api/projects', (req, res) => {
    db('projects')
    .then(arr => {
      if (arr.length > 0) {
        arr.forEach(project => {
            if (project.project_complete === 0) {
                project.project_complete = false;
            } else {
                project.project_complete = true;
            }
        })
      res.status(200).json(arr);
      } else {
       res.status(404).json({ error: 'No projects to display.'})
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Failed to get projects.'})
    })
  });

  server.put('/api/projects/:id', (req, res) => {
    const {id} = req.params;
    const project = req.body;
    if (project.project_name){ 
    db('projects').where('id',id).update(project)
    .then(count => {
      if (count) {
      res.status(200).json({ success: 'Updated project' });
      } else {
        res.status(404).json({ error: 'Project with that ID does not exist.' })
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Failed to update.'})
    })
    } else {
      res.status(400).json({ error: "Please provide a project name." })
    }
  });

  server.put('/api/actions/:id', (req, res) => {
    const {id} = req.params;
    const action = req.body;
    if (action.action_description){ 
    db('actions').where('id', id).update(action)
    .then(count => {
      if (count) {
      res.status(200).json({ success: 'Updated action' });
      } else {
        res.status(404).json({ error: 'Action with that ID does not exist.' })
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Failed to update.'})
    })
    } else {
      res.status(400).json({ error: "Please provide an action description." })
    }
  });

  const port = 3302;
  server.listen(port, function() {
    console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
  });
   

