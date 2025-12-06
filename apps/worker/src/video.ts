import fs from 'fs';
import { spawn } from 'child_process';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const CreateVideo = (pythonCode: string): Promise<{
    success: boolean;
    videoPath?: string;
    error?: string;
}> => {

    return new Promise((resolve, reject) => {
        try {

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const outputDir = path.join(__dirname, '../videos')
            const timestamp = Date.now();
            const scriptPath = path.join(outputDir, `scene_${timestamp}.py`);
            const cleanCode = pythonCode.trim();

            fs.writeFileSync(scriptPath, cleanCode);

            const manim = spawn('manim', [
                '-pql',
                scriptPath,
                'VideoScene'
            ],
            );

            let stdout = '';
            let stderr = '';

            manim.stdout.on('data', (data) => {
                stdout += data.toString();
                console.log(`Manim: ${data}`);
            });

            manim.stderr.on('data', (data) => {
                stderr += data.toString();
                console.error(`Manim Error: ${data}`);
            });

            manim.on('close', (code) => {
                if (code === 0) {
                    const videoPathMatch = stdout.match(/File ready at '(.+?)'/);
                    const videoPath = videoPathMatch ? videoPathMatch[1] : null;

                    resolve({
                        success: true,
                        videoPath: videoPath || 'Video generated successfully'
                    });
                } else {
                    resolve({
                        success: false,
                        error: `Manim exited with code ${code}: ${stderr}`
                    });
                }

            });

        } catch (error) {
            reject({
                success: false,
                error: `Failed to run Manim: ${error}`
            });
        }
    });
};


export default CreateVideo;

