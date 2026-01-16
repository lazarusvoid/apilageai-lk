document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const openBtn = document.getElementById('mindmap-open-btn');
    const closeBtn = document.getElementById('mindmap-close-btn');
    const lightbox = document.getElementById('mindmap-lightbox');
    const goBtn = document.getElementById('mindmap-go-btn');
    const developBtn = document.getElementById('mindmap-develop-btn');
    const inputArea = document.getElementById('mindmap-input');
    const developInput = document.getElementById('mindmap-develop-input');
    const rightPanel = document.getElementById('mindmap-right-panel');
    const visualizer = document.getElementById('mindmap-visualizer');
    const canvas = document.getElementById('mindmap-canvas');
    const loader = document.getElementById('mindmap-loader');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const savePngBtn = document.getElementById('save-png-btn');
    const addNodeBtn = document.getElementById('add-node-btn');
    const addTextBtn = document.getElementById('add-text-btn');
    const connectNodeBtn = document.getElementById('connect-node-btn');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const contextMenu = document.getElementById('context-menu');
    const ctxAddSubnodes = document.getElementById('ctx-add-subnodes');
    
    // --- State Management ---
    let activeElement = null;
    let nodeElements = new Map();
    let mindmapDataStructure = null;
    let svgLayer = null;
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let canvasOffset = { x: 0, y: 0 };
    let zoom = 1;
    let isConnectingMode = false;
    let connectionStartNode = null;
    let selectedConnector = null;
    let selectedNodeForContext = null;

    // --- Lightbox Controls ---
    const openLightbox = () => lightbox.classList.add('visible');
    const closeLightbox = () => lightbox.classList.remove('visible');
    openBtn.addEventListener('click', (e) => { e.preventDefault(); openLightbox(); });
    closeBtn.addEventListener('click', closeLightbox);

    // --- API & Data Handling ---
    
    const API_ENDPOINT = "https://apilageai.lk/api/mindmap.php";

    async function callAPI(action, payload) {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...payload })
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            const apiResponse = await response.json();
            
            if (apiResponse.success && apiResponse.data) {
                let textContent = apiResponse.data;
                
                if (typeof textContent === 'string') {
                    textContent = textContent.replace(/``````/gi, '').trim();
                    
                    const firstBrace = textContent.indexOf('{');
                    const lastBrace = textContent.lastIndexOf('}');
                    const firstBracket = textContent.indexOf('[');
                    const lastBracket = textContent.lastIndexOf(']');
                    
                    if (firstBracket !== -1 && firstBracket < firstBrace) {
                        const jsonString = textContent.slice(firstBracket, lastBracket + 1);
                        return JSON.parse(jsonString);
                    } else if (firstBrace !== -1 && lastBrace !== -1) {
                        const jsonString = textContent.slice(firstBrace, lastBrace + 1);
                        return JSON.parse(jsonString);
                    } else {
                        throw new Error("Valid JSON not found in API response.");
                    }
                } else if (typeof textContent === 'object') {
                    return textContent;
                }
            } else {
                throw new Error(apiResponse.error || "API returned unsuccessful response");
            }
        } catch (error) {
            console.error("Error calling API:", error);
            alert(`API call failed: ${error.message}. Using local simulation as a fallback.`);
            return generateMockDataFromText(inputArea.value);
        }
    }
    
    function generateMockDataFromText(text) {
        const words = [...new Set(text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/))]
            .filter(word => word.length > 2);

        if (words.length === 0) return { id: 'root-empty', topic: 'No Text', children: [] };

        const mainTopic = words.length > 1 ? words.slice(0, 2).join(' ') : words[0];
        let remainingWords = words.slice(2);
        
        const mindmap = { id: 'root', topic: mainTopic, note: `This is the central theme.`, children: [] };

        for (let i = 0; i < Math.min(4, remainingWords.length); i++) {
            const branchTopic = remainingWords[i];
            const branch = { id: `b${i}`, topic: branchTopic, note: `A key concept related to ${mainTopic}.`, children: [] };
            mindmap.children.push(branch);
        }
        
        mindmap.children.forEach((child, i) => {
            const subWords = remainingWords.slice(4 + (i*3));
            if(subWords.length > 0) child.children.push({id: `${child.id}-1`, topic: subWords[0], note: `Detail about ${child.topic}.`, children: [
                (subWords.length > 2 ? {id: `${child.id}-1-1`, topic: subWords[2], note: `Sub-detail.`} : null)
            ].filter(n => n)});
            if(subWords.length > 1) child.children.push({id: `${child.id}-2`, topic: subWords[1], note: `More detail about ${child.topic}.`});
        });

        return mindmap;
    }

    // --- Mind Map Generation & Development ---
    goBtn.addEventListener('click', async () => {
        const text = inputArea.value.trim();
        if (!text) {
            alert('Please enter some text to generate a mind map.');
            return;
        }
        await generateOrUpdateMindmap(() => callAPI('generate', { text }));
    });

    developBtn.addEventListener('click', async () => {
        const instruction = developInput.value.trim();
        if (!instruction || !mindmapDataStructure) {
            alert('Please generate a mind map first and provide an instruction.');
            return;
        }
        await generateOrUpdateMindmap(() => callAPI('develop', { 
            instruction, 
            currentMap: mindmapDataStructure 
        }));
    });
    
    ctxAddSubnodes.addEventListener('click', async () => {
        if (!selectedNodeForContext) return;
        const nodeData = nodeElements.get(selectedNodeForContext.dataset.id).data;
        
        loader.style.display = 'flex';
        const newChildren = await callAPI('addSubnodes', { topic: nodeData.topic });
        
        if (Array.isArray(newChildren)) {
            function findAndAddChildren(node) {
                if (node.id === nodeData.id) {
                    if (!node.children) node.children = [];
                    node.children.push(...newChildren);
                    return true;
                }
                if (node.children) {
                    for (const child of node.children) {
                        if (findAndAddChildren(child)) return true;
                    }
                }
                return false;
            }
            findAndAddChildren(mindmapDataStructure);
            renderMindmap(mindmapDataStructure);
        } else {
            alert("AI did not return valid sub-nodes.");
        }
        loader.style.display = 'none';
    });

    async function generateOrUpdateMindmap(dataFetchFunction) {
        loader.style.display = 'flex';
        canvas.innerHTML = ''; 
        if (svgLayer) svgLayer.remove();
        nodeElements.clear();
        resetCanvas();

        const data = await dataFetchFunction();
        mindmapDataStructure = data;

        if (data && data.id) {
            renderMindmap(data);
        } else {
            alert("Could not generate a valid mind map structure.");
        }
        
        loader.style.display = 'none';
    }

    function renderMindmap(data) {
        svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLayer.style.position = 'absolute';
        svgLayer.style.width = '100%'; 
        svgLayer.style.height = '100%';
        svgLayer.style.top = '0';
        svgLayer.style.left = '0';
        svgLayer.style.pointerEvents = 'none';
        canvas.appendChild(svgLayer);

        // Build hierarchical structure with parent references
        const hierarchyData = buildHierarchy(data);
        
        // Create all node elements first
        hierarchyData.nodes.forEach(nodeData => {
            createNodeElement(nodeData);
        });
        
        // Position nodes with radial layout
        layoutNodesRadially(hierarchyData);
        
        // Draw all connections based on hierarchy
        drawAllConnections(hierarchyData);
    }
    
    // Build proper hierarchy with parent-child relationships
    function buildHierarchy(root) {
        const nodes = [];
        const relationships = [];
        let colorIndex = 0;

        function traverse(node, parent, level, parentColor) {
            if (!node || !node.id) return;
            
            const currentColor = level === 1 ? (colorIndex++ % 4) : parentColor;
            
            const nodeData = {
                id: node.id,
                topic: node.topic,
                note: node.note,
                level: level,
                parentId: parent ? parent.id : null,
                parentColorIndex: currentColor,
                children: []
            };
            
            nodes.push(nodeData);
            
            if (parent) {
                relationships.push({
                    childId: node.id,
                    parentId: parent.id
                });
                
                // Find parent in nodes and add child reference
                const parentNode = nodes.find(n => n.id === parent.id);
                if (parentNode) {
                    parentNode.children.push(nodeData);
                }
            }
            
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(child => traverse(child, node, level + 1, currentColor));
            }
        }
        
        traverse(root, null, 0, -1);
        
        return { nodes, relationships };
    }
    
    function createNodeElement(nodeData) {
        const nodeEl = document.createElement('div');
        nodeEl.id = `mindmap-node-${nodeData.id}`;
        nodeEl.className = 'mindmap-node';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = nodeData.topic;
        nodeEl.appendChild(textSpan);
        
        nodeEl.dataset.id = nodeData.id;
        
        if (nodeData.level === 0) {
            nodeEl.classList.add(`color-main`);
        } else {
            nodeEl.classList.add(`color-${nodeData.parentColorIndex}`);
        }
        nodeEl.setAttribute('data-color-index', nodeData.parentColorIndex);

        makeEditable(textSpan);
        makeDraggable(nodeEl);
        
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'node-actions';
        
        const infoBtn = document.createElement('div');
        infoBtn.className = 'node-action-btn info-node-btn';
        infoBtn.innerHTML = '<i class="fa-solid fa-info"></i>';
        
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'node-action-btn delete-node-btn';
        deleteBtn.innerHTML = '&times;';
        
        actionsWrapper.appendChild(infoBtn);
        actionsWrapper.appendChild(deleteBtn);
        nodeEl.appendChild(actionsWrapper);

        const noteEl = document.createElement('div');
        noteEl.className = 'node-note';
        noteEl.textContent = nodeData.note || 'Click to add a note.';
        noteEl.setAttribute('contenteditable', 'true');
        nodeEl.appendChild(noteEl);

        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            noteEl.style.display = noteEl.style.display === 'block' ? 'none' : 'block';
        });
        deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteNode(nodeEl); });

        canvas.appendChild(nodeEl);
        nodeElements.set(nodeData.id, { el: nodeEl, data: nodeData });
    }

    // Improved radial layout
    function layoutNodesRadially(hierarchyData) {
        const { width, height } = canvas.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Position root node at center
        const rootNode = hierarchyData.nodes.find(n => n.level === 0);
        if (rootNode) {
            const rootEl = nodeElements.get(rootNode.id).el;
            rootNode.x = centerX;
            rootNode.y = centerY;
            rootEl.style.left = `${centerX - rootEl.offsetWidth / 2}px`;
            rootEl.style.top = `${centerY - rootEl.offsetHeight / 2}px`;
        }
        
        // Group nodes by parent
        const nodesByParent = {};
        hierarchyData.relationships.forEach(rel => {
            if (!nodesByParent[rel.parentId]) {
                nodesByParent[rel.parentId] = [];
            }
            const childNode = hierarchyData.nodes.find(n => n.id === rel.childId);
            if (childNode) {
                nodesByParent[rel.parentId].push(childNode);
            }
        });
        
        // Position each group of children around their parent
        Object.keys(nodesByParent).forEach(parentId => {
            const children = nodesByParent[parentId];
            const parentNode = hierarchyData.nodes.find(n => n.id === parentId);
            
            if (!parentNode) return;
            
            // Ensure parent has position
            if (parentNode.x === undefined || parentNode.y === undefined) {
                parentNode.x = centerX;
                parentNode.y = centerY;
            }
            
            const parentX = parentNode.x;
            const parentY = parentNode.y;
            const level = children[0].level;
            const radius = 180 + (level * 120);
            
            // Distribute children evenly in a circle around parent
            const angleStep = (2 * Math.PI) / children.length;
            
            children.forEach((child, idx) => {
                const angle = idx * angleStep - Math.PI / 2; // Start from top
                child.x = parentX + Math.cos(angle) * radius;
                child.y = parentY + Math.sin(angle) * radius;
                
                const childEl = nodeElements.get(child.id).el;
                if (childEl) {
                    childEl.style.left = `${child.x - childEl.offsetWidth / 2}px`;
                    childEl.style.top = `${child.y - childEl.offsetHeight / 2}px`;
                }
            });
        });
        
        // Apply collision detection
        resolveCollisions(hierarchyData.nodes, 5);
        
        // Update final positions
        hierarchyData.nodes.forEach(node => {
            const nodeEl = nodeElements.get(node.id).el;
            if (nodeEl && node.x !== undefined && node.y !== undefined) {
                nodeEl.style.left = `${node.x - nodeEl.offsetWidth / 2}px`;
                nodeEl.style.top = `${node.y - nodeEl.offsetHeight / 2}px`;
            }
        });
    }
    
    // Draw all connections accurately
    function drawAllConnections(hierarchyData) {
        svgLayer.innerHTML = '';
        
        // Draw each parent-child relationship
        hierarchyData.relationships.forEach(rel => {
            const childEl = nodeElements.get(rel.childId)?.el;
            const parentEl = nodeElements.get(rel.parentId)?.el;
            
            if (childEl && parentEl) {
                drawConnection(childEl, parentEl, false);
            } else {
                console.warn(`Missing element for connection: ${rel.childId} -> ${rel.parentId}`);
            }
        });
    }
    
    // Collision detection and resolution
    function resolveCollisions(nodes, iterations) {
        const minDistance = 100;
        
        for (let iter = 0; iter < iterations; iter++) {
            let collisionDetected = false;
            
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const node1 = nodes[i];
                    const node2 = nodes[j];
                    
                    if (!node1.x || !node1.y || !node2.x || !node2.y) continue;
                    
                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < minDistance && distance > 0) {
                        collisionDetected = true;
                        
                        const overlap = minDistance - distance;
                        const moveX = (dx / distance) * overlap * 0.5;
                        const moveY = (dy / distance) * overlap * 0.5;
                        
                        if (node1.level !== 0) {
                            node1.x -= moveX;
                            node1.y -= moveY;
                        }
                        
                        if (node2.level !== 0) {
                            node2.x += moveX;
                            node2.y += moveY;
                        }
                    }
                }
            }
            
            if (!collisionDetected) break;
        }
    }
    
    // --- Node and Connection Management ---
    function deleteNode(nodeEl) {
        const nodeId = nodeEl.dataset.id;
        nodeEl.remove();
        svgLayer.querySelectorAll(`[data-start-node*="${nodeId}"], [data-end-node*="${nodeId}"]`).forEach(line => line.remove());
        nodeElements.delete(nodeId);
    }

    function drawConnection(childEl, parentEl, isManual = false) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'mindmap-connector');
        path.setAttribute('data-start-node', childEl.id);
        path.setAttribute('data-end-node', parentEl.id);
        if (isManual) path.setAttribute('data-manual', 'true');
        svgLayer.prepend(path);
        updateConnection(path);
        
        path.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectedConnector) {
                selectedConnector.classList.remove('selected');
            }
            selectedConnector = path;
            path.classList.add('selected');
        });

        return path;
    }

    function updateConnection(path) {
        const startNode = document.getElementById(path.dataset.startNode);
        const endNode = document.getElementById(path.dataset.endNode);
        if (!startNode || !endNode) return;

        const startPos = { x: startNode.offsetLeft + startNode.offsetWidth / 2, y: startNode.offsetTop + startNode.offsetHeight / 2 };
        const endPos = { x: endNode.offsetLeft + endNode.offsetWidth / 2, y: endNode.offsetTop + endNode.offsetHeight / 2 };
        
        const midX = startPos.x + (endPos.x - startPos.x) * 0.5;
        const d = `M${startPos.x},${startPos.y} C${midX},${startPos.y} ${midX},${endPos.y} ${endPos.x},${endPos.y}`;
        path.setAttribute('d', d);
    }

    function updateConnectionsForNode(nodeEl) {
        const nodeId = nodeEl.id;
        svgLayer.querySelectorAll(`[data-start-node="${nodeId}"], [data-end-node="${nodeId}"]`).forEach(updateConnection);
    }

    // --- Interactivity ---
    addNodeBtn.addEventListener('click', () => {
        const { width, height } = canvas.getBoundingClientRect();
        const newNodeData = {
            id: `manual-${Date.now()}`,
            topic: 'New Topic',
            note: 'Click to edit note.',
            level: 1,
            parentColorIndex: Math.floor(Math.random() * 4)
        };
        createNodeElement(newNodeData);
        const newNodeEl = nodeElements.get(newNodeData.id).el;
        
        newNodeEl.style.left = `${(width / 2) - (canvasOffset.x / zoom) - newNodeEl.offsetWidth / 2}px`;
        newNodeEl.style.top = `${(height / 2) - (canvasOffset.y / zoom) - newNodeEl.offsetHeight / 2}px`;
    });
    
    addTextBtn.addEventListener('click', () => {
        const { width, height } = visualizer.getBoundingClientRect();
        const textBlock = document.createElement('div');
        textBlock.className = 'manual-text-block';
        textBlock.textContent = 'Editable text';
        textBlock.setAttribute('contenteditable', 'true');
        
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-text-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => textBlock.remove());
        textBlock.appendChild(deleteBtn);
        
        textBlock.style.left = `${(width / 2) - (canvasOffset.x / zoom) - 75}px`;
        textBlock.style.top = `${(height / 2) - (canvasOffset.y / zoom) - 20}px`;
        canvas.appendChild(textBlock);
        makeDraggable(textBlock, false);
    });

    connectNodeBtn.addEventListener('click', () => {
        isConnectingMode = !isConnectingMode;
        rightPanel.classList.toggle('connecting-mode', isConnectingMode);
        connectNodeBtn.classList.toggle('active', isConnectingMode);
        if (!isConnectingMode && connectionStartNode) {
            connectionStartNode.classList.remove('connection-start');
            connectionStartNode = null;
        }
    });

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            rightPanel.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    });
    
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            setTimeout(recenterCanvas, 100);
        }
    });

    savePngBtn.addEventListener('click', () => {
        const elementsToHide = document.querySelectorAll('.node-actions, .help-text, .mindmap-toolbar, .delete-text-btn');
        elementsToHide.forEach(el => el.style.visibility = 'hidden');

        html2canvas(canvas, {
            backgroundColor: null, 
            scale: 2 
        }).then(canvasOutput => {
            const link = document.createElement('a');
            link.download = 'mindmap.png';
            link.href = canvasOutput.toDataURL('image/png');
            link.click();
            
            elementsToHide.forEach(el => el.style.visibility = 'visible');
        });
    });

    function makeEditable(textContainer) {
        textContainer.parentElement.addEventListener('dblclick', (e) => {
            if (e.target === textContainer.parentElement || e.target === textContainer) {
                textContainer.setAttribute('contenteditable', 'true');
                textContainer.focus();
                document.execCommand('selectAll', false, null);
            }
        });
        textContainer.addEventListener('blur', () => textContainer.setAttribute('contenteditable', 'false'));
        textContainer.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); textContainer.blur(); } });
    }

    function makeDraggable(el, isSimNode = true) {
        el.addEventListener('mousedown', (e) => {
            if (e.target.isContentEditable || e.target.closest('.node-actions') || e.target.closest('.delete-text-btn')) return;
            e.preventDefault();
            e.stopPropagation();

            if (isConnectingMode && isSimNode) {
                if (!connectionStartNode) {
                    connectionStartNode = el;
                    el.classList.add('connection-start');
                } else {
                    if (connectionStartNode !== el) {
                        drawConnection(el, connectionStartNode, true);
                    }
                    connectionStartNode.classList.remove('connection-start');
                    connectionStartNode = null;
                    isConnectingMode = false;
                    rightPanel.classList.remove('connecting-mode');
                    connectNodeBtn.classList.remove('active');
                }
                return;
            }
            
            activeElement = el;
            const startPos = { x: activeElement.offsetLeft, y: activeElement.offsetTop };
            const mouseStart = { x: e.clientX, y: e.clientY };
            
            function onDrag(e) {
                if (!activeElement) return;
                const dx = (e.clientX - mouseStart.x) / zoom;
                const dy = (e.clientY - mouseStart.y) / zoom;
                activeElement.style.left = `${startPos.x + dx}px`;
                activeElement.style.top = `${startPos.y + dy}px`;
                if (isSimNode) updateConnectionsForNode(activeElement);
            }
            
            function onStopDrag() {
                activeElement = null;
                document.removeEventListener('mousemove', onDrag);
            }

            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', onStopDrag, { once: true });
        });
        
        el.addEventListener('touchstart', (e) => {
            if (e.target.isContentEditable || e.target.closest('.node-actions') || e.target.closest('.delete-text-btn')) return;
            if (e.touches.length > 1) return;
            e.preventDefault();
            e.stopPropagation();

            if (isConnectingMode && isSimNode) {
                if (!connectionStartNode) {
                    connectionStartNode = el;
                    el.classList.add('connection-start');
                } else {
                    if (connectionStartNode !== el) {
                        drawConnection(el, connectionStartNode, true);
                    }
                    connectionStartNode.classList.remove('connection-start');
                    connectionStartNode = null;
                    isConnectingMode = false;
                    rightPanel.classList.remove('connecting-mode');
                    connectNodeBtn.classList.remove('active');
                }
                return;
            }

            activeElement = el;
            const startPos = { x: activeElement.offsetLeft, y: activeElement.offsetTop };
            const touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };

            function onTouchMove(ev) {
                if (!activeElement) return;
                if (!ev.touches || ev.touches.length === 0) return;
                const dx = (ev.touches[0].clientX - touchStart.x) / zoom;
                const dy = (ev.touches[0].clientY - touchStart.y) / zoom;
                activeElement.style.left = `${startPos.x + dx}px`;
                activeElement.style.top = `${startPos.y + dy}px`;
                if (isSimNode) updateConnectionsForNode(activeElement);
            }
            function onTouchEnd(ev) {
                activeElement = null;
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
            }
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd, { once: true });
        });
    }

    rightPanel.addEventListener('mousedown', (e) => {
        if (e.target !== rightPanel && e.target !== visualizer && e.target !== canvas) return;
        if (selectedConnector) {
            selectedConnector.classList.remove('selected');
            selectedConnector = null;
        }
        isPanning = true;
        panStart = { x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y };
    });
    
    rightPanel.addEventListener('touchstart', (e) => {
        if (e.target !== rightPanel && e.target !== visualizer && e.target !== canvas) return;
        if (selectedConnector) {
            selectedConnector.classList.remove('selected');
            selectedConnector = null;
        }
        if (!e.touches || e.touches.length > 1) return;
        isPanning = true;
        panStart = { x: e.touches[0].clientX - canvasOffset.x, y: e.touches[0].clientY - canvasOffset.y };
    });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            canvasOffset.x = e.clientX - panStart.x;
            canvasOffset.y = e.clientY - panStart.y;
            updateCanvasTransform();
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isPanning && e.touches && e.touches.length === 1) {
            canvasOffset.x = e.touches[0].clientX - panStart.x;
            canvasOffset.y = e.touches[0].clientY - panStart.y;
            updateCanvasTransform();
        }
    }, { passive: false });

    document.addEventListener('mouseup', (e) => {
        isPanning = false;
    });
    
    document.addEventListener('touchend', (e) => {
        isPanning = false;
    });
    
    zoomInBtn.addEventListener('click', () => {
        zoom = Math.min(2, zoom + 0.1);
        updateCanvasTransform();
    });
    zoomInBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        zoom = Math.min(2, zoom + 0.1);
        updateCanvasTransform();
    }, { passive: false });
    zoomOutBtn.addEventListener('click', () => {
        zoom = Math.max(0.3, zoom - 0.1);
        updateCanvasTransform();
    });
    zoomOutBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        zoom = Math.max(0.3, zoom - 0.1);
        updateCanvasTransform();
    }, { passive: false });

    function updateCanvasTransform() {
        canvas.style.transform = `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`;
    }

    function resetCanvas() {
        canvasOffset = { x: 0, y: 0 };
        zoom = 1;
        updateCanvasTransform();
    }

    function recenterCanvas() {
        const vizRect = visualizer.getBoundingClientRect();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        if (nodeElements.size === 0) return;

        nodeElements.forEach(({ el }) => {
            minX = Math.min(minX, el.offsetLeft);
            minY = Math.min(minY, el.offsetTop);
            maxX = Math.max(maxX, el.offsetLeft + el.offsetWidth);
            maxY = Math.max(maxY, el.offsetTop + el.offsetHeight);
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const contentCenterX = minX + contentWidth / 2;
        const contentCenterY = minY + contentHeight / 2;

        zoom = Math.min(vizRect.width / contentWidth, vizRect.height / contentHeight) * 0.8;

        canvasOffset.x = vizRect.width / 2 - contentCenterX * zoom;
        canvasOffset.y = vizRect.height / 2 - contentCenterY * zoom;

        updateCanvasTransform();
    }

    // Context Menu Logic
    if (!('ontouchstart' in window)) {
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const nodeEl = e.target.closest('.mindmap-node');
            if (nodeEl) {
                selectedNodeForContext = nodeEl;
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
            }
        });
    }
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
        selectedNodeForContext = null;
    });

    // Connector Deletion
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedConnector) {
            selectedConnector.remove();
            selectedConnector = null;
        }
    });
});