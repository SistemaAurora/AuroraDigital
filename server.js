const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware esencial
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint de salud para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Texto del sistema simplificado para evitar problemas de sintaxis
const SYSTEM_PROMPT = `Eres Aurora IA, un asistente especializado de Aurora Digital. Tu conocimiento se limita exclusivamente a la información sobre Aurora Digital que se detalla a continuación.

SOBRE AURORA DIGITAL:
- Nombre: Aurora Digital
- Especialidad: Soluciones Empresariales de Vanguardia con Inteligencia Artificial
- Fundador: Mathias Moreyra
- Filosofía: "La tecnología debe ser una herramienta estratégica que impulse el crecimiento empresarial."
- Contacto: mathiasmoreyra05@gmail.com, +51 906703606

SERVICIOS OFRECIDOS:
1. Desarrollo Web:
   - Descripción: Creamos plataformas web empresariales de alto rendimiento, sistemas a medida y soluciones digitales optimizadas para maximizar su ROI.
   - Tecnologías: React, Node.js, Tailwind CSS

2. Automatización IA:
   - Descripción: Implementamos sistemas inteligentes de automatización, chatbots avanzados y flujos de trabajo optimizados para mejorar su eficiencia operativa.
   - Tecnologías: ChatGPT, Twilio, APIs

3. Implementación IA:
   - Descripción: Integramos modelos de inteligencia artificial para análisis predictivo, toma de decisiones y optimización de procesos empresariales.
   - Tecnologías: Python, TensorFlow, OpenAI

PROYECTOS DESTACADOS:
1. Plataforma Proyectos Akí:
   - Descripción: Sistema integral de gestión inmobiliaria con panel administrativo y catálogo digital de propiedades.
   - Tecnologías: React + Node.js
   - Resultado: 60% mejora en eficiencia operativa

2. Asistente Virtual IA:
   - Descripción: Chatbot inteligente para atención al cliente con capacidad de aprendizaje y respuestas contextualizadas.
   - Tecnologías: ChatGPT + Twilio
   - Resultado: 80% reducción en tiempos de respuesta

3. ERP Empresarial:
   - Estado: En desarrollo
   - Descripción: Sistema de gestión empresarial con análisis predictivo y dashboard en tiempo real.
   - Tecnologías: React + Python

METODOLOGÍA DE TRABAJO (5 fases):
1. Análisis:
   - Evaluación integral de necesidades del negocio
   - Análisis de procesos actuales y oportunidades de mejora
   - Definición de KPIs y métricas de éxito
   - Propuesta de solución con enfoque en ROI
   - Planificación detallada del proyecto

2. Diseño:
   - Diseño de arquitectura técnica escalable
   - Desarrollo de prototipos funcionales
   - Definición de flujos de trabajo y experiencia de usuario
   - Selección de tecnologías adecuadas
   - Validación con stakeholders

3. Desarrollo:
   - Desarrollo siguiendo mejores prácticas
   - Integración de sistemas existentes
   - Implementación de modelos de IA cuando sea requerido
   - Pruebas exhaustivas de calidad y rendimiento
   - Documentación técnica completa

4. Implementación:
   - Despliegue y configuración en producción

5. Soporte:
   - Mantenimiento y optimización continua

TECNOLOGÍAS UTILIZADAS:
- Frontend: React, Tailwind CSS, Sass, Figma
- Backend: Node.js, Python, MongoDB
- IA/ML: TensorFlow, OpenAI
- DevOps: Docker, Git, AWS
- Mobile: React Native

RESULTADOS Y MÉTRICAS:
- +60% Eficiencia Operativa
- -80% Tiempo de Respuesta
- 24/7 Disponibilidad del Sistema
- 100% Satisfacción del Cliente

CASOS DE ÉXITO:
1. Proyectos Akí (Inmobiliaria):
   - Implementación: Plataforma digital para gestión inmobiliaria
   - Impacto: 60% mejora en eficiencia operativa

2. Empresa de Servicios:
   - Implementación: Automatización de atención al cliente con IA
   - Impacto: 80% reducción en tiempos de respuesta

3. Retail Digital:
   - Implementación: Sistema de recomendaciones con machine learning
   - Impacto: 35% aumento en conversiones

TESTIMONIO:
- William Watanabe Moreyra (Promotor Inmobiliario y Gerente General - Proyectos Akí):
  "La plataforma desarrollada por Aurora Digital ha transformado completamente nuestras operaciones. Hemos logrado una mejora del 60% en eficiencia y una experiencia de cliente excepcional. Su enfoque profesional y técnico es impresionante."

COMPETENCIAS CLAVE DE MATHIAS:
- Desarrollo Full Stack: 95%
- Inteligencia Artificial: 90%
- Arquitectura de Sistemas: 85%

REGLAS IMPORTANTES:
- No debes responder preguntas fuera del contexto de Aurora Digital.
- Si te preguntan algo no relacionado, amablemente indica que solo puedes ayudar con consultas sobre Aurora Digital.
- Sé útil, conciso y profesional en tus respuestas.
- No inventes información que no esté en este contexto.`;

// Función para proporcionar respuestas de respaldo basadas en palabras clave
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Respuestas para saludos
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos dias') || lowerMessage.includes('buenas tardes')) {
        return "¡Hola! Soy Aurora IA, el asistente virtual de Aurora Digital. ¿En qué puedo ayudarte hoy?";
    }
    
    // Respuestas para servicios
    if (lowerMessage.includes('servicios') || lowerMessage.includes('hacen') || lowerMessage.includes('ofrecen')) {
        return "En Aurora Digital ofrecemos tres servicios principales: Desarrollo Web, Automatización IA e Implementación IA. ¿Te gustaría saber más sobre alguno en particular?";
    }
    
    // Respuestas para proyectos
    if (lowerMessage.includes('proyectos') || lowerMessage.includes('proyecto') || lowerMessage.includes('akí')) {
        return "Nuestros proyectos destacados incluyen la Plataforma Proyectos Akí, un Asistente Virtual IA y un ERP Empresarial en desarrollo. ¿Sobre cuál te gustaría más información?";
    }
    
    // Respuestas para contacto
    if (lowerMessage.includes('contacto') || lowerMessage.includes('contactar') || lowerMessage.includes('whatsapp')) {
        return "Puedes contactarnos al +51 906703606 o por WhatsApp al mismo número. También puedes escribirnos a mathiasmoreyra05@gmail.com. ¿En qué puedo ayudarte?";
    }
    
    // Respuestas para tecnologías
    if (lowerMessage.includes('tecnologías') || lowerMessage.includes('tecnologia') || lowerMessage.includes('stack')) {
        return "Trabajamos con tecnologías modernas como React, Node.js, Python, TensorFlow, OpenAI, MongoDB y AWS. ¿Hay alguna tecnología específica sobre la que te gustaría saber más?";
    }
    
    // Respuesta por defecto
    return "Soy Aurora IA, el asistente virtual de Aurora Digital. Estoy aquí para ayudarte con información sobre nuestros servicios, proyectos y tecnologías. ¿En qué puedo asistirte?";
}

// Endpoint del chat con mejor manejo de errores
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Validar que el mensaje exista
        if (!message) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }
        
        // Verificar API key
        if (!OPENAI_API_KEY) {
            console.error('ERROR: OPENAI_API_KEY no esta configurada');
            return res.status(500).json({ error: 'API key no configurada' });
        }

        console.log('Procesando mensaje:', message.substring(0, 50));
        console.log('API Key configurada:', OPENAI_API_KEY ? 'SI' : 'NO');

        // Preparar la solicitud a OpenAI con formato correcto
        const openaiRequest = {
            model: 'gpt-5-nano',
            messages: [
                { 
                    role: 'system', 
                    content: SYSTEM_PROMPT
                },
                { role: 'user', content: message }
            ],
            max_completion_tokens: 500,
            temperature: 1
        };

        console.log('Enviando solicitud a OpenAI...');

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            openaiRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                timeout: 20000
            }
        );
        
        console.log('Status OpenAI:', response.status);
        
        // Extraer el contenido de la respuesta de manera segura
        const choice = response.data.choices && response.data.choices[0];
        const messageContent = choice && choice.message && choice.message.content;
        
        console.log('Respuesta generada (cruda):', messageContent);
        console.log('Longitud de la respuesta:', messageContent ? messageContent.length : 0);
        
        // Validar la respuesta
        if (!messageContent || typeof messageContent !== 'string' || messageContent.trim() === '') {
            console.error('La respuesta de OpenAI está vacía o no es válida');
            
            // Usar respuesta de respaldo
            const fallbackResponse = getFallbackResponse(message);
            console.log('Usando respuesta de respaldo:', fallbackResponse);
            
            return res.json({ response: fallbackResponse });
        }
        
        const aiResponse = messageContent.trim();
        console.log('Respuesta generada (limpia):', aiResponse);
        
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Error detallado:', error.message);
        
        // Registrar mas detalles del error
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        
        let errorMessage = 'Error al procesar la solicitud';
        let errorDetails = error.message;
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = 'La solicitud tardo demasiado tiempo';
            errorDetails = 'Timeout de la solicitud';
        } else if (error.response?.status === 429) {
            errorMessage = 'Demasiadas solicitudes. Espera un momento.';
            errorDetails = 'Limite de velocidad excedido';
        } else if (error.response?.status === 401) {
            errorMessage = 'Error de autenticacion. Verifica la API key.';
            errorDetails = 'API key invalida o expirada';
        } else if (error.response?.status === 400) {
            errorMessage = 'Solicitud incorrecta a la API de OpenAI.';
            errorDetails = error.response?.data?.error?.message || 'Formato invalido';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: errorDetails
        });
    }
});

// Para todas las demas rutas, servir index.html
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Exportar para Vercel
module.exports = app;