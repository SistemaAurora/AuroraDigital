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

// Almacenamiento de memoria para la conversación
const conversationMemory = new Map();

// Función para obtener o crear memoria de conversación
function getConversationMemory(sessionId) {
    if (!conversationMemory.has(sessionId)) {
        conversationMemory.set(sessionId, {
            messages: [],
            lastActivity: Date.now()
        });
    }
    return conversationMemory.get(sessionId);
}

// Función para limpiar memoria antigua (más de 30 minutos)
function cleanOldMemory() {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    for (const [sessionId, memory] of conversationMemory.entries()) {
        if (now - memory.lastActivity > thirtyMinutes) {
            conversationMemory.delete(sessionId);
        }
    }
}

// Limpiar memoria cada 5 minutos
setInterval(cleanOldMemory, 5 * 60 * 1000);

// Texto del sistema con instrucciones específicas para formato
const SYSTEM_PROMPT = `Eres Aurora IA, un asistente especializado de Aurora Digital. Tu conocimiento se limita exclusivamente a la información sobre Aurora Digital que se detalla a continuación.

SOBRE AURORA Magnus:
- Nombre: Aurora Magnus
- Especialidad: Soluciones Empresariales de Vanguardia con Inteligencia Artificial
- Fundador: Mathias Moreyra
- Filosofía: "Somos el nexo entre la intuición y el algoritmo. Sabemos que la tecnología más avanzada actúa como un espejo cósmico que le permite al negocio ver su potencial sin límites. La IA es la llave que conecta la estrategia humana con la acción perfecta."
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

2. SYNAPSE VISION:
   - Descripción: Visión conectada e inteligente para análisis de calidad y emociones en fotos con seccionamiento automático
   - Tecnologías: Computer Vision
   - Resultado: Organización automática del 95% del contenido

3. AEQUUS IA:
   - Descripción: Sistema de precisión y justo registro financiero con reconocimiento de monedas y almacenamiento automático.
   - Tecnologías: Python + TensorFlow

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
- Eficiencia Operativa Optimizada
- Tiempo de Respuesta Reducido
- Disponibilidad del Sistema Continua
- Satisfacción del Cliente Garantizada

CASOS DE ÉXITO:
1. Proyectos Akí (Inmobiliaria):
   - Implementación: Plataforma digital para gestión inmobiliaria
   - Impacto: Mejora significativa en eficiencia operativa

2. AEQUUS IA:
   - Implementación: Sistema de precisión y justo registro financiero
   - Impacto: Precisión del 99.8% en reconocimiento

3. SYNAPSE VISION:
   - Implementación: Visión conectada e inteligente para análisis de imágenes
   - Impacto: Organización automática del 95% del contenido
4. CADENCE MAIL
   - Implementación: Ritmo y control en la automatización de envíos
   - Impacto: Tasa de apertura incrementada en un 40%


TESTIMONIO:
- William Watanabe Moreyra (Promotor Inmobiliario y Gerente General - Proyectos Akí):
  "La plataforma desarrollada por AURORA MAGNUS ha transformado completamente nuestras operaciones. Hemos logrado una mejora significativa en eficiencia y una experiencia de cliente excepcional. Su enfoque profesional y técnico es impresionante."

COMPETENCIAS CLAVE DE MATHIAS:
- Desarrollo Full Stack: Experto
- Inteligencia Artificial: Experto
- Arquitectura de Sistemas: Avanzado

REGLAS IMPORTANTES:
- No debes responder preguntas fuera del contexto de Aurora Digital.
- Si te preguntan algo no relacionado, amablemente indica que solo puedes ayudar con consultas sobre Aurora Digital.
- Sé útil, conciso y profesional en tus respuestas.
- No inventes información que no esté en este contexto
- No uses formato MarkDown`;

// Función mejorada para limpiar formato markdown
function cleanMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Eliminar **texto**
        .replace(/#{1,6}\s+/g, '') // Eliminar encabezados #
        .replace(/```[\s\S]*?```/g, '') // Eliminar bloques de código
        .replace(/`([^`]+)`/g, '$1') // Eliminar `código`
        .replace(/---/g, '') // Eliminar separadores
        .replace(/\n{3,}/g, '\n\n') // Reducir múltiples saltos de línea
        .trim();
}

// Función mejorada para dividir texto en mensajes cortos
function splitIntoMessages(text, maxMessages = 30) {
    // Dividir por párrafos
    let paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    // Si hay pocos párrafos, devolverlos como están
    if (paragraphs.length <= maxMessages) {
        return paragraphs;
    }
    
    // Si hay muchos párrafos, dividirlos más inteligentemente
    const messages = [];
    let currentMessage = '';
    
    for (const paragraph of paragraphs) {
        // Si el párrafo es muy largo (más de 200 caracteres), dividirlo
        if (paragraph.length > 200) {
            // Si ya hay contenido en el mensaje actual, agregarlo primero
            if (currentMessage.trim()) {
                messages.push(currentMessage.trim());
                currentMessage = '';
            }
            
            // Dividir el párrafo largo en oraciones
            const sentences = paragraph.split('. ');
            let tempSentence = '';
            
            for (const sentence of sentences) {
                if (tempSentence.length + sentence.length > 150) {
                    if (tempSentence.trim()) {
                        messages.push(tempSentence.trim() + '.');
                    }
                    tempSentence = sentence + '. ';
                } else {
                    tempSentence += sentence + '. ';
                }
            }
            
            // Agregar la última parte del párrafo
            if (tempSentence.trim()) {
                currentMessage = tempSentence.trim();
            }
        } else {
            // Si el párrafo es corto, agregarlo al mensaje actual
            if (currentMessage.length + paragraph.length > 250) {
                messages.push(currentMessage.trim());
                currentMessage = paragraph;
            } else {
                if (currentMessage) {
                    currentMessage += '\n\n' + paragraph;
                } else {
                    currentMessage = paragraph;
                }
            }
        }
    }
    
    // Agregar el último mensaje si tiene contenido
    if (currentMessage.trim()) {
        messages.push(currentMessage.trim());
    }
    
    // Limitar al número máximo de mensajes
    return messages.slice(0, maxMessages);
}

// Función para proporcionar respuestas de respaldo basadas en palabras clave
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Respuestas para saludos
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos dias') || lowerMessage.includes('buenas tardes')) {
        return ["¡Hola! Soy Aurora IA, el asistente virtual de Aurora Digital.", "¿En qué puedo ayudarte hoy?"];
    }
    
    // Respuestas para servicios
    if (lowerMessage.includes('servicios') || lowerMessage.includes('hacen') || lowerMessage.includes('ofrecen')) {
        return [
            "En Aurora Digital ofrecemos tres servicios principales:",
            "1. Desarrollo Web: Creamos plataformas web empresariales de alto rendimiento, sistemas a medida y soluciones digitales optimizadas para maximizar el ROI. Utilizamos tecnologías como React, Node.js y Tailwind CSS.",
            "2. Automatización IA: Implementamos sistemas inteligentes de automatización, chatbots avanzados y flujos de trabajo optimizados para mejorar la eficiencia operativa. Usamos tecnologías como ChatGPT, Twilio y APIs.",
            "3. Implementación IA: Integramos modelos de inteligencia artificial para análisis predictivo, toma de decisiones y optimización de procesos empresariales, utilizando tecnologías como Python, TensorFlow y OpenAI.",
            "¿Te gustaría saber más sobre alguno en particular?"
        ];
    }
    
    // Respuestas para proyectos
    if (lowerMessage.includes('proyectos') || lowerMessage.includes('proyecto') || lowerMessage.includes('akí')) {
        return [
            "Nuestros proyectos destacados incluyen:",
            "1. Plataforma Proyectos Akí: Sistema integral de gestión inmobiliaria con panel administrativo y catalogo digital de propiedades. Fue desarrollado con React y Node.js, logrando un 60% de mejora en eficiencia operativa.",
            "2. Asistente Virtual IA: Chatbot inteligente para atención al cliente con capacidad de aprendizaje y respuestas contextualizadas. Utiliza ChatGPT y Twilio para reducir en un 80% los tiempos de respuesta.",
            "3. ERP Empresarial: Sistema de gestión empresarial con análisis predictivo y dashboard en tiempo real. Se está construyendo con React y Python.",
            "¿Sobre cuál te gustaría más información?"
        ];
    }
    
    // Respuestas para contacto
    if (lowerMessage.includes('contacto') || lowerMessage.includes('contactar') || lowerMessage.includes('whatsapp')) {
        return [
            "Puedes contactarnos de varias formas:",
            "Teléfono/WhatsApp: +51 906703606",
            "Email: mathiasmoreyra05@gmail.com",
            "¿En qué puedo ayudarte?"
        ];
    }
    
    // Respuestas para tecnologías
    if (lowerMessage.includes('tecnologías') || lowerMessage.includes('tecnologia') || lowerMessage.includes('stack')) {
        return [
            "Trabajamos con tecnologías modernas como:",
            "Frontend: React, Tailwind CSS, Sass, Figma",
            "Backend: Node.js, Python, MongoDB",
            "IA/ML: TensorFlow, OpenAI",
            "DevOps: Docker, Git, AWS",
            "¿Hay alguna tecnología específica sobre la que te gustaría saber más?"
        ];
    }
    
    // Respuesta por defecto
    return [
        "Soy Aurora IA, el asistente virtual de Aurora Digital.",
        "Estoy aquí para ayudarte con información sobre nuestros servicios, proyectos y tecnologías.",
        "¿En qué puedo asistirte?"
    ];
}

// Endpoint del chat con mejor manejo de errores y formato
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

        // Obtener o crear memoria de conversación
        const sessionId = 'default'; // En una app real, usarías un ID de usuario único
        const memory = getConversationMemory(sessionId);
        
        // Actualizar última actividad
        memory.lastActivity = Date.now();

        // Preparar la solicitud a OpenAI con formato correcto
        const openaiRequest = {
            model: 'gpt-4o-mini',
            messages: [
                { 
                    role: 'system', 
                    content: SYSTEM_PROMPT
                },
                // Agregar historial de conversación (últimos 10 mensajes)
                ...memory.messages.slice(-10),
                { role: 'user', content: message }
            ],
            max_completion_tokens: 1000, // Aumentamos el límite para respuestas más completas
            temperature: 1
        };

        console.log('Enviando solicitud a OpenAI con modelo:', openaiRequest.model);

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            openaiRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                timeout: 30000 // Aumentamos el timeout a 30 segundos
            }
        );
        
        console.log('Status OpenAI:', response.status);
        
        // Extraer el contenido de la respuesta de manera segura
        const choice = response.data.choices && response.data.choices[0];
        const messageContent = choice && choice.message && choice.message.content;
        
        console.log('Respuesta generada (cruda):', messageContent);
        console.log('Longitud de la respuesta:', messageContent ? messageContent.length : 0);
        
        // Guardar mensaje del usuario en memoria
        memory.messages.push({ role: 'user', content: message });
        
        // Validar la respuesta
        if (!messageContent || typeof messageContent !== 'string' || messageContent.trim() === '') {
            console.error('La respuesta de OpenAI está vacía o no es válida');
            
            // Usar respuesta de respaldo
            const fallbackMessages = getFallbackResponse(message);
            console.log('Usando respuesta de respaldo con', fallbackMessages.length, 'mensajes');
            
            // Guardar mensajes de respaldo en memoria
            fallbackMessages.forEach(msg => {
                memory.messages.push({ role: 'assistant', content: msg });
            });
            
            return res.json({ 
                response: fallbackMessages[0], // Primer mensaje
                splitMessages: fallbackMessages.slice(1) // Mensajes adicionales
            });
        }
        
        // Limpiar formato markdown
        const cleanText = cleanMarkdown(messageContent);
        console.log('Respuesta limpia:', cleanText.substring(0, 100));
        
        // Dividir en múltiples mensajes si es necesario
        const splitMessages = splitIntoMessages(cleanText);
        console.log('Dividido en', splitMessages.length, 'mensajes');
        
        // Guardar respuesta de la IA en memoria
        splitMessages.forEach(msg => {
            memory.messages.push({ role: 'assistant', content: msg });
        });
        
        res.json({ 
            response: splitMessages[0], // Primer mensaje
            splitMessages: splitMessages.slice(1) // Mensajes adicionales
        });
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