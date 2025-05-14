import { Router } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { insertIdpProviderSchema, insertIdpMappingSchema, insertIdpRuleSchema } from '@shared/schema';

// Create the router
const router = Router();

// IDP Provider routes
router.get('/providers', async (req, res) => {
  try {
    const providers = await storage.getIdpProviders();
    res.json(providers);
  } catch (error) {
    console.error('Error fetching IDP providers:', error);
    res.status(500).json({ error: 'Failed to fetch IDP providers' });
  }
});

router.get('/providers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const provider = await storage.getIdpProviderById(id);
    
    if (!provider) {
      return res.status(404).json({ error: 'IDP provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    console.error('Error fetching IDP provider:', error);
    res.status(500).json({ error: 'Failed to fetch IDP provider' });
  }
});

router.post('/providers', async (req, res) => {
  try {
    const data = insertIdpProviderSchema.parse(req.body);
    const provider = await storage.createIdpProvider(data);
    res.status(201).json(provider);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating IDP provider:', error);
    res.status(500).json({ error: 'Failed to create IDP provider' });
  }
});

router.put('/providers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertIdpProviderSchema.partial().parse(req.body);
    const provider = await storage.updateIdpProvider(id, data);
    
    if (!provider) {
      return res.status(404).json({ error: 'IDP provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating IDP provider:', error);
    res.status(500).json({ error: 'Failed to update IDP provider' });
  }
});

router.delete('/providers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteIdpProvider(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting IDP provider:', error);
    res.status(500).json({ error: 'Failed to delete IDP provider' });
  }
});

router.post('/providers/:id/verify', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.verifyIdpProvider(id);
    
    if (!success) {
      return res.status(404).json({ error: 'IDP provider not found' });
    }
    
    res.json({ success: true, verified: true });
  } catch (error) {
    console.error('Error verifying IDP provider:', error);
    res.status(500).json({ error: 'Failed to verify IDP provider' });
  }
});

// IDP Mapping routes
router.get('/providers/:providerId/mappings', async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);
    const mappings = await storage.getIdpMappings(providerId);
    res.json(mappings);
  } catch (error) {
    console.error('Error fetching IDP mappings:', error);
    res.status(500).json({ error: 'Failed to fetch IDP mappings' });
  }
});

router.get('/mappings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mapping = await storage.getIdpMappingById(id);
    
    if (!mapping) {
      return res.status(404).json({ error: 'IDP mapping not found' });
    }
    
    res.json(mapping);
  } catch (error) {
    console.error('Error fetching IDP mapping:', error);
    res.status(500).json({ error: 'Failed to fetch IDP mapping' });
  }
});

router.post('/mappings', async (req, res) => {
  try {
    const data = insertIdpMappingSchema.parse(req.body);
    const mapping = await storage.createIdpMapping(data);
    res.status(201).json(mapping);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating IDP mapping:', error);
    res.status(500).json({ error: 'Failed to create IDP mapping' });
  }
});

router.put('/mappings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertIdpMappingSchema.partial().parse(req.body);
    const mapping = await storage.updateIdpMapping(id, data);
    
    if (!mapping) {
      return res.status(404).json({ error: 'IDP mapping not found' });
    }
    
    res.json(mapping);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating IDP mapping:', error);
    res.status(500).json({ error: 'Failed to update IDP mapping' });
  }
});

router.delete('/mappings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteIdpMapping(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting IDP mapping:', error);
    res.status(500).json({ error: 'Failed to delete IDP mapping' });
  }
});

// IDP Rules routes
router.get('/providers/:providerId/rules', async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);
    const rules = await storage.getIdpRules(providerId);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching IDP rules:', error);
    res.status(500).json({ error: 'Failed to fetch IDP rules' });
  }
});

router.get('/rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rule = await storage.getIdpRuleById(id);
    
    if (!rule) {
      return res.status(404).json({ error: 'IDP rule not found' });
    }
    
    res.json(rule);
  } catch (error) {
    console.error('Error fetching IDP rule:', error);
    res.status(500).json({ error: 'Failed to fetch IDP rule' });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const data = insertIdpRuleSchema.parse(req.body);
    const rule = await storage.createIdpRule(data);
    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating IDP rule:', error);
    res.status(500).json({ error: 'Failed to create IDP rule' });
  }
});

router.put('/rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertIdpRuleSchema.partial().parse(req.body);
    const rule = await storage.updateIdpRule(id, data);
    
    if (!rule) {
      return res.status(404).json({ error: 'IDP rule not found' });
    }
    
    res.json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating IDP rule:', error);
    res.status(500).json({ error: 'Failed to update IDP rule' });
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteIdpRule(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting IDP rule:', error);
    res.status(500).json({ error: 'Failed to delete IDP rule' });
  }
});

// IDP Sessions routes
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const sessions = await storage.getIdpSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching IDP sessions:', error);
    res.status(500).json({ error: 'Failed to fetch IDP sessions' });
  }
});

router.get('/sessions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const session = await storage.getIdpSessionById(id);
    
    if (!session) {
      return res.status(404).json({ error: 'IDP session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching IDP session:', error);
    res.status(500).json({ error: 'Failed to fetch IDP session' });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await storage.terminateIdpSession(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error terminating IDP session:', error);
    res.status(500).json({ error: 'Failed to terminate IDP session' });
  }
});

export default router;