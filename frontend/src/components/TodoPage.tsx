/**
 * @todo YOU HAVE TO IMPLEMENT THE DELETE AND SAVE TASK ENDPOINT, A TASK CANNOT BE UPDATED IF THE TASK NAME DID NOT CHANGE, YOU'VE TO CONTROL THE BUTTON STATE ACCORDINGLY
 */
import { Check, Delete } from '@mui/icons-material';
import { Box, Button, Container, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch.ts';
import { Task } from '../index';
import useUiToast from '../hooks/useUiToast.ts';

const TodoPage = () => {
  const api = useFetch();
  const toast = useUiToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [editedTasks, setEditedTasks] = useState<{[key: number]: string}>({});

  const handleFetchTasks = async () => {
    try {
      const result = await api.get('/tasks');
      if (result) {
        setTasks(result);
      } else {
        toast.error('Erreur lors du chargement des tâches');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des tâches');
    }
  };

  const handleDelete = async (id: number) => {
    // @todo IMPLEMENT HERE : DELETE THE TASK & REFRESH ALL THE TASKS, DON'T FORGET TO ATTACH THE FUNCTION TO THE APPROPRIATE BUTTON
    await api.delete(`/tasks/${id}`);
    handleFetchTasks();
  }

  const handleSave = async () => {
    if (!newTask.trim()) return;
  
    // Vérifier si le nom de la tâche existe déjà
    const taskExists = tasks.some(task => task.name.toLowerCase() === newTask.trim().toLowerCase());
    if (taskExists) {
      toast.error('Une tâche avec ce nom existe déjà');
      return;
    }
  
    try {
      const loading = toast.loading('Adding task...');
      const result = await api.post('/tasks', { name: newTask });
      
      if (result?.id) {
        loading.update('Task added successfully!', 'success');
        setNewTask('');
        handleFetchTasks();
      } else {
        loading.update('Error while adding task', 'error');
      }
    } catch (error: any) {
      toast.error(error.message || 'A task with this name already exists');
      setNewTask('');
    }
  };

  const handleTaskChange = (taskId: number, value: string) => {
    setEditedTasks(prev => ({
      ...prev,
      [taskId]: value
    }));
  };

  const handleUpdateTask = async (taskId: number) => {
    const newName = editedTasks[taskId];
    if (!newName || newName.trim() === '') return;

    // Check if the task name already exists
    const taskExists = tasks.some(task => task.name.toLowerCase() === newName.trim().toLowerCase() && task.id !== taskId);
    if (taskExists) {
      toast.error('A task with this name already exists');
      return;
    }

    try {
      const loading = toast.loading('Updating task...');
      const result = await api.patch(`/tasks/${taskId}`, { id: taskId, name: newName });
      
      if (result?.id) {
        loading.update('Task updated successfully!', 'success');
        handleFetchTasks();
        setEditedTasks(prev => {
          const newState = { ...prev };
          delete newState[taskId];
          return newState;
        });
      } else {
        loading.update('Error while updating task', 'error');
      }
    } catch (error: any) {
      toast.error(error.message || 'A task with this name already exists');
    }
  };

  useEffect(() => {
    (async () => {
      handleFetchTasks();
    })();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2">HDM Todo List</Typography>
      </Box>

      <Box justifyContent="center" mt={5} flexDirection="column">
        {
          Array.isArray(tasks) && tasks.map((task) => (
            <Box key={task.id} display="flex" justifyContent="center" alignItems="center" mt={2} gap={1} width="100%">
              <TextField 
                size="small" 
                value={editedTasks[task.id] !== undefined ? editedTasks[task.id] : task.name} 
                onChange={(e) => handleTaskChange(task.id, e.target.value)}
                fullWidth 
                sx={{ maxWidth: 350 }} 
              />
              <Box>
                <IconButton 
                  color="success" 
                  disabled={!editedTasks[task.id] || editedTasks[task.id].trim() === task.name}
                  onClick={() => handleUpdateTask(task.id)}
                >
                  <Check />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(task.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          ))
        }

        <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={1}>
          <TextField
            size="small"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nouvelle tâche"
            sx={{ maxWidth: 350 }}
          />
          <Button variant="outlined" onClick={handleSave}>Ajouter une tâche</Button>
        </Box>
      </Box>
    </Container>
  );
}

export default TodoPage;
