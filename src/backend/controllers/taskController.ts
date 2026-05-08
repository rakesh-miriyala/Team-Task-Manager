import { Request, Response } from 'express';
import prisma from '../../lib/prisma.ts';
import { AuthRequest } from '../../middleware/auth.ts';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, status, dueDate, projectId, assignedToId } = req.body;

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const finalDueDate = (parsedDueDate && !isNaN(parsedDueDate.getTime())) ? parsedDueDate : null;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: finalDueDate,
        projectId,
        assignedToId,
        createdById: req.user!.id
      },
      include: {
        assignedTo: { select: { name: true } },
        project: { select: { title: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { id, role } = req.user!;
    const { status, priority, projectId } = req.query;

    const where: any = {};
    if (role !== 'ADMIN') {
      where.OR = [
        { assignedToId: id },
        { project: { members: { some: { userId: id } } } }
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assignedToId } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    // RBAC: Members can ONLY update status of tasks in projects they belong to
    if (req.user!.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          projectId: existingTask.projectId,
          userId: req.user!.id
        }
      });

      if (!isMember) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this project' });
      }
      
      // If member, only allow status update
      if (title || description || priority || dueDate || assignedToId) {
         if (title !== existingTask.title || description !== existingTask.description || priority !== existingTask.priority || assignedToId !== existingTask.assignedToId) {
            return res.status(403).json({ message: 'Access denied: Members can only update status' });
         }
      }
    }

    const parsedDueDate = dueDate === '' ? null : (dueDate ? new Date(dueDate) : undefined);
    const finalDueDate = (parsedDueDate instanceof Date && isNaN(parsedDueDate.getTime())) ? undefined : parsedDueDate;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        status,
        dueDate: finalDueDate,
        assignedToId
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error updating task', error });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Error deleting task', error });
  }
};
