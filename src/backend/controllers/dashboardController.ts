import { Response } from 'express';
import prisma from '../../lib/prisma.ts';
import { AuthRequest } from '../../middleware/auth.ts';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id, role } = req.user!;

    // Filter by member if not admin
    const projectWhere = role === 'ADMIN' ? {} : {
      members: { some: { userId: id } }
    };
    
    const taskWhere = role === 'ADMIN' ? {} : {
      OR: [
        { assignedToId: id },
        { project: { members: { some: { userId: id } } } }
      ]
    };

    const totalProjects = await prisma.project.count({ where: projectWhere });
    const totalTasks = await prisma.task.count({ where: taskWhere });
    
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: taskWhere,
      _count: true
    });

    const completedTasks = tasksByStatus.find(s => s.status === 'COMPLETED')?._count || 0;
    const pendingTasks = totalTasks - completedTasks;

    const today = new Date();
    const overdueTasks = await prisma.task.count({
      where: {
        ...taskWhere,
        status: { not: 'COMPLETED' },
        dueDate: { lt: today }
      }
    });

    // Recent activity (simple implementation: newest tasks/projects)
    const recentTasks = await prisma.task.findMany({
      where: taskWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { title: true } } }
    });

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus: tasksByStatus.map(s => ({ status: s.status, count: s._count })),
      recentActivity: recentTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
}
