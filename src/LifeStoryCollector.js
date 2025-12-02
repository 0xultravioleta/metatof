/**
 * LifeStoryCollector - Collects life data and generates stories via LLM API
 */
export class LifeStoryCollector {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.history = [];
        this.events = [];
        this.isGenerating = false;
        this.onStoryGenerated = null;
        this.onError = null;
        this.frameCount = 0;
    }

    /**
     * Record consciousness state at current progress
     */
    record(progress, consciousness) {
        this.frameCount++;
        // Sample every 10 frames to avoid too much data
        if (this.frameCount % 10 === 0) {
            this.history.push({
                p: progress,
                c: consciousness,
                t: Date.now()
            });
        }
    }

    /**
     * Record an event that was triggered
     */
    recordEvent(eventData) {
        this.events.push({
            name: eventData.name,
            age: eventData.age,
            t: eventData.t,
            consciousness: eventData.consciousness,
            color: eventData.color
        });
    }

    /**
     * Reset for new life
     */
    reset() {
        this.history = [];
        this.events = [];
        this.frameCount = 0;
    }

    /**
     * Get collected data summary
     */
    getSummary() {
        if (this.history.length === 0) {
            return null;
        }

        const avgC = this.history.reduce((sum, h) => sum + h.c, 0) / this.history.length;
        const maxC = Math.max(...this.history.map(h => h.c));
        const minC = Math.min(...this.history.map(h => h.c));
        const finalC = this.history[this.history.length - 1].c;

        return {
            averageConsciousness: avgC,
            maxConsciousness: maxC,
            minConsciousness: minC,
            finalConsciousness: finalC,
            totalEvents: this.events.length,
            transmuted: this.events.filter(e => e.color === "#ffff00").length,
            fallen: this.events.filter(e => e.color === "#ff0000").length,
            neutral: this.events.filter(e => e.color === "#ffffff").length
        };
    }

    /**
     * Generate story when life ends
     */
    async generateStory() {
        if (this.isGenerating) {
            console.log("Story generation already in progress");
            return null;
        }

        if (this.history.length < 50) {
            console.log("Not enough data to generate story");
            return null;
        }

        this.isGenerating = true;

        try {
            const finalConsciousness = this.history[this.history.length - 1].c;
            const karma = this.calculateKarma();

            const payload = {
                history: this.history,
                events: this.events,
                finalConsciousness,
                karma
            };

            console.log("Generating story with data:", {
                historyPoints: this.history.length,
                events: this.events.length,
                karma: karma.toFixed(2)
            });

            const response = await fetch(this.apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            if (this.onStoryGenerated) {
                this.onStoryGenerated(result);
            }

            return result;

        } catch (error) {
            console.error("Error generating story:", error);
            if (this.onError) {
                this.onError(error);
            }
            return null;

        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Calculate karma based on life history
     */
    calculateKarma() {
        if (this.history.length === 0) return 0;

        // Weighted average: later life matters more
        let weightedSum = 0;
        let weightSum = 0;

        this.history.forEach((h, i) => {
            const weight = (i + 1) / this.history.length; // 0 to 1
            weightedSum += h.c * weight;
            weightSum += weight;
        });

        // Factor in how events were handled
        const eventBonus = this.events.reduce((sum, e) => {
            if (e.color === "#ffff00") return sum + 0.05; // Transmuted
            if (e.color === "#ff0000") return sum - 0.05; // Fallen
            return sum;
        }, 0);

        let karma = (weightedSum / weightSum) + eventBonus;

        // Clamp to -1 to 1
        return Math.max(-1, Math.min(1, karma));
    }
}
