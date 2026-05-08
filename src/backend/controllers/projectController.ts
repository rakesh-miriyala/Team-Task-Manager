import { Request, Response } from 'express';
import prisma from '../../lib/prisma.ts';
import { AuthRequest } from '../../middleware/auth.ts';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dueDate, memberIds } = req.body;
    
    // Ensure unique member IDs and add creator
    const uniqueMemberIds = Array.from(new Set([
      req.user!.id,
      ...(memberIds || [])
    ]));
    
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (parsedDueDate && isNaN(parsedDueDate.getTime())) {
      // Just log and set to null if invalid, or return 400
      console.warn('Invalid due date provided:', dueDate);
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        dueDate: (parsedDueDate && !isNaN(parsedDueDate.getTime())) ? parsedDueDate : null,
        members: {
          create: uniqueMemberIds.map((userId: string) => ({ userId }))
        }
      },
      include: {
        members: { include: { user: { select: { name: true, email: true } } } }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project', error });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { id, role } = req.user!;
    
    // Admins see all projects, members see only theirs
    const where = role === 'ADMIN' ? {} : {
      members: { some: { userId: id } }
    };

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true, members: true } },
        members: { include: { user: { select: { id: true, name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: { 
            assignedTo: { select: { id: true, name: true } },
            createdBy: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if member
    if (req.user!.role !== 'ADMIN') {
      const isMember = project.members.some(m => m.userId === req.user!.id);
      if (!isMember) return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, memberIds } = req.body;

    const parsedDueDate = dueDate === '' ? null : (dueDate ? new Date(dueDate) : undefined);
    const finalDueDate = (parsedDueDate instanceof Date && isNaN(parsedDueDate.getTime())) ? undefined : parsedDueDate;

    const project = await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          title,
          description,
          dueDate: finalDueDate,
        }
      });

      if (memberIds) {
        const uniqueMemberIds = Array.from(new Set(memberIds)) as string[];
        await tx.projectMember.deleteMany({ where: { projectId: id } });
        // Using a transaction and individual creates for maximal reliability with SQLite
        for (const uId of uniqueMemberIds) {
          await tx.projectMember.create({
            data: { userId: uId, projectId: id }
          });
        }
      }

      return updatedProject;
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project', error });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};
