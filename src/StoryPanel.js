/**
 * StoryPanel - UI panel to display generated life stories
 */
export class StoryPanel {
    constructor() {
        this.panel = null;
        this.content = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        // Create panel container
        this.panel = document.createElement('div');
        this.panel.id = 'story-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 350px;
            max-height: calc(100vh - 120px);
            background: rgba(0, 0, 0, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            color: #fff;
            font-family: 'Georgia', serif;
            z-index: 200;
            overflow-y: auto;
            display: none;
            box-shadow: 0 0 30px rgba(153, 0, 255, 0.3);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        `;

        const title = document.createElement('h3');
        title.textContent = 'HISTORIA DE VIDA';
        title.style.cssText = `
            margin: 0;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, 0.8);
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.style.cssText = `
            background: none;
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Content area
        this.content = document.createElement('div');
        this.content.id = 'story-content';
        this.content.style.cssText = `
            font-size: 14px;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.9);
        `;

        // Loading indicator
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: rgba(255, 255, 255, 0.6);
        `;
        this.loadingIndicator.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 15px;">...</div>
            <div>Consultando el Akasha...</div>
            <div style="font-size: 12px; margin-top: 10px; opacity: 0.6;">Interpretando los registros de tu vida</div>
        `;

        this.panel.appendChild(header);
        this.panel.appendChild(this.content);
        document.body.appendChild(this.panel);

        // Mobile responsiveness
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            this.panel.style.width = 'calc(100vw - 40px)';
            this.panel.style.left = '20px';
            this.panel.style.right = '20px';
            this.panel.style.maxHeight = '60vh';
            this.panel.style.bottom = '80px';
            this.panel.style.top = 'auto';
        } else {
            this.panel.style.width = '350px';
            this.panel.style.left = '20px';
            this.panel.style.right = 'auto';
            this.panel.style.maxHeight = 'calc(100vh - 120px)';
            this.panel.style.top = '20px';
            this.panel.style.bottom = 'auto';
        }
    }

    show() {
        this.panel.style.display = 'block';
        this.isVisible = true;
    }

    hide() {
        this.panel.style.display = 'none';
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    showLoading() {
        this.content.innerHTML = '';
        this.content.appendChild(this.loadingIndicator.cloneNode(true));
        this.show();
    }

    showError(message) {
        this.content.innerHTML = `
            <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                <div style="font-size: 24px; margin-bottom: 10px;">Error</div>
                <div style="font-size: 13px; opacity: 0.8;">${message}</div>
            </div>
        `;
    }

    displayStory(storyData) {
        const { story, karma, provider, timestamp } = storyData;

        // Format the story with proper paragraphs
        const paragraphs = story.split('\n\n').filter(p => p.trim());

        let html = '';

        paragraphs.forEach(p => {
            html += `<p style="margin: 0 0 15px 0; text-align: justify;">${p.trim()}</p>`;
        });

        // Add karma indicator
        const karmaColor = karma > 0.3 ? '#9900ff' : karma < -0.3 ? '#ff6600' : '#ffffff';
        const karmaLabel = karma > 0.3 ? 'Luminoso' : karma < -0.3 ? 'Oscuro' : 'Equilibrado';

        html += `
            <div style="
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid rgba(255,255,255,0.2);
                font-family: 'Inter', sans-serif;
                font-size: 11px;
                color: rgba(255,255,255,0.5);
            ">
                <div style="margin-bottom: 8px;">
                    <span>Karma resultante: </span>
                    <span style="color: ${karmaColor}; font-weight: bold;">${karma.toFixed(2)} (${karmaLabel})</span>
                </div>
                <div style="opacity: 0.6;">
                    Interpretado por ${provider === 'anthropic' ? 'Claude' : 'GPT-4'}
                </div>
            </div>
        `;

        this.content.innerHTML = html;
        this.show();
    }

    clear() {
        this.content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.5);">
                <div style="font-size: 13px;">Vive tu vida...</div>
                <div style="font-size: 12px; margin-top: 10px; opacity: 0.6;">
                    La historia se generara al completar el ciclo
                </div>
            </div>
        `;
    }
}
