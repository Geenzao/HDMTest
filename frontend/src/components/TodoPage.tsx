/**
 * Main TodoPage component that handles the todo list functionality
 * Features: Create, Read, Update, Delete tasks with search functionality
 */
import { Check, Delete } from '@mui/icons-material';
import { Box, Button, Checkbox, Container, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import useFetch from '../hooks/useFetch.ts';
import { Task } from '../index';
import useUiToast from '../hooks/useUiToast.ts';

const TodoPage = () => {
  const api = useFetch();
  const toast = useUiToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editedTasks, setEditedTasks] = useState<{[key: number]: string}>({});

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  // Fetch all tasks from the API
  const handleFetchTasks = async () => {
    try {
      const result = await api.get('/tasks');
      if (result) {
        setTasks(result);
      } else {
        toast.error('Error loading tasks');
      }
    } catch (error) {
      toast.error('Error loading tasks');
    }
  };

  // Delete a task by ID
  const handleDelete = async (id: number) => {
    try {
      const loading = toast.loading('Deleting task...');
      await api.delete(`/tasks/${id}`);
      loading.update('Task deleted successfully!', 'success');
      handleFetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Error while deleting task');
    }
  };

  // Create a new task
  const handleSave = async () => {
    if (!newTask.trim()) return;
  
    const taskExists = tasks.some(task => task.name.toLowerCase() === newTask.trim().toLowerCase());
    if (taskExists) {
      toast.error('A task with this name already exists');
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

  // Handle task name changes in edit mode
  const handleTaskChange = (taskId: number, value: string) => {
    setEditedTasks(prev => ({
      ...prev,
      [taskId]: value
    }));
  };

  // Update existing task
  const handleUpdateTask = async (taskId: number) => {
    const newName = editedTasks[taskId];
    if (!newName || newName.trim() === '') return;

    const taskExists = tasks.some(task => 
      task.name.toLowerCase() === newName.trim().toLowerCase() && task.id !== taskId
    );
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
      toast.error(error.message || 'Error updating task');
    }
  };

  // Toggle task completion status
  const handleToggleDone = async (taskId: number, currentDone: boolean) => {
    try {
      const loading = toast.loading('Updating task status...');
      const result = await api.patch(`/tasks/${taskId}`, { id: taskId, done: !currentDone });
      
      if (result?.id) {
        loading.update('Task status updated successfully!', 'success');
        handleFetchTasks();
      } else {
        loading.update('Error updating task status', 'error');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating task status');
    }
  };

  // Initial load of tasks
  useEffect(() => {
    handleFetchTasks();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2">Todo List</Typography>
      </Box>

      <Box display="flex" justifyContent="center" mt={3}>
        <TextField
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          sx={{ maxWidth: 350 }}
        />
      </Box>

      <Box justifyContent="center" mt={5} flexDirection="column">
        {
          Array.isArray(filteredTasks) && filteredTasks.map((task) => (
            <Box key={task.id} display="flex" justifyContent="center" alignItems="center" mt={2} gap={1} width="100%">
              <Checkbox
                checked={task.done}
                onChange={() => handleToggleDone(task.id, task.done)}
              />
              <TextField 
                size="small" 
                value={editedTasks[task.id] !== undefined ? editedTasks[task.id] : task.name} 
                onChange={(e) => handleTaskChange(task.id, e.target.value)}
                fullWidth 
                sx={{ 
                  maxWidth: 350,
                  '& .MuiInputBase-input': {
                    textDecoration: task.done ? 'line-through' : 'none',
                  }
                }} 
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
            placeholder="New task"
            sx={{ maxWidth: 350 }}
          />
          <Button variant="outlined" onClick={handleSave}>Add a task</Button>
        </Box>
      </Box>
    </Container>
  );
}

export default TodoPage;
