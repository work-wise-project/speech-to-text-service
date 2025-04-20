import { GoogleAuth } from 'google-auth-library';

export async function checkAuthConnection() {
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    try {
        console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();

        console.log('ADC is working');
        console.log('Project ID:', projectId);

        if ((client as any).email) {
            console.log('Service Account Email:', (client as any).email);
        } else {
            console.log('Not using a service account or email not available');
        }
    } catch (error) {
        console.error('Error checking ADC:', error);
    }
}
