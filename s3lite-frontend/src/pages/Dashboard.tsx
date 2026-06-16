import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { Topbar } from '../components/Dashboard/Topbar';
import { FileList } from '../components/Dashboard/FileList';
import { BucketsTable } from '../components/Dashboard/BucketsTable';
import { DetailPanel } from '../components/Dashboard/DetailPanel';
import { ObjectsTable } from '../components/Dashboard/ObjectsTable';
import { BucketModal } from '../components/Dashboard/BucketModal';
import { UploadModal } from '../components/Dashboard/UploadModal';
import { DeleteModal } from '../components/Dashboard/DeleteModal';
import { ToastContainer, ToastProps } from '../components/Dashboard/ToastContainer';
import { getUsername, getAuthToken, apiClient, BASE_URL, removeAuthToken, removeUsername } from '../api';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'activity' | 'comments' | 'versions'>('activity');
    const [currentBucket, setCurrentBucket] = useState('');
    const [buckets, setBuckets] = useState<any[]>([]);
    const [objects, setObjects] = useState<any[]>([]);

    // Modals state
    const [isCreateBucketOpen, setIsCreateBucketOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const navigate = useNavigate();

    const fetchBuckets = async () => {
        try {
            const data = await apiClient('/buckets');
            if (data && Array.isArray(data)) {
                setBuckets(data);
            }
        } catch (err) {
            console.error("Failed to fetch buckets", err);
        }
    };

    const fetchObjects = async () => {
        if (!currentBucket) return;
        try {
            const data = await apiClient(`/buckets/${currentBucket}/objects`);
            if (data && data.objects && Array.isArray(data.objects)) {
                setObjects(data.objects);
            }
        } catch (err) {
            console.error("Failed to fetch objects", err);
        }
    };

    useEffect(() => {
        if (!currentBucket) {
            fetchBuckets();
            setObjects([]);
        } else {
            fetchObjects();
        }
    }, [currentBucket]);

    const handleCreateBucket = async (name: string) => {
        try {
            await apiClient(`/buckets/${name}`, { method: 'PUT' });
            setIsCreateBucketOpen(false);
            setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Success', message: 'Bucket created!', type: 'success' }]);
            fetchBuckets();
        } catch (err: any) {
            setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Error', message: err.message, type: 'error' }]);
        }
    };

    const handleUpload = async (file: File, key: string) => {
        // Use the filename as fallback if the user left the key field empty
        const objectKey = key.trim() || file.name;

        if (!currentBucket) {
            setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Error', message: 'No bucket selected. Please explore a bucket first.', type: 'error' }]);
            return;
        }

        try {
            // Use raw fetch to guarantee Content-Type: application/octet-stream
            // (apiClient's File detection can be overridden by the browser's file MIME type)
            const token = getAuthToken();
            const encodedBucket = encodeURIComponent(currentBucket);
            const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
            const res = await fetch(`${BASE_URL}/storage/${encodedBucket}/${encodedKey}`, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (res.status === 401) {
                /*
               removeAuthToken();
               removeUsername();
               window.location.href = '/login'; */
                console.log('401 recibido', await res.clone().json().catch(() => 'sin body'));
                return;
            }
            if (!res.ok) {
                let msg = `Error ${res.status}`;
                try { const d = await res.json(); msg = d.message || msg; } catch (_) { }
                throw new Error(msg);
            }
            setIsUploadOpen(false);
            setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Success', message: 'File uploaded successfully!', type: 'success' }]);
            fetchObjects();
        } catch (err: any) {
            setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Error', message: err.message, type: 'error' }]);
        }
    };

    const handleDelete = () => {
        console.log("Delete");
        setIsDeleteOpen(false);
    };

    const handleLogout = () => {
        removeAuthToken();
        removeUsername();
        navigate('/login');
    };

    const sidebar = (
        <Sidebar
            userName={getUsername()}
            storageUsedGB={0}
            storageTotalGB={10}
            onExploreBucket={(name) => setCurrentBucket(name)}
            onLogout={handleLogout}
        />
    );

    const topbar = (
        <Topbar
            onFiles={() => setCurrentBucket('')}
            onActivities={() => console.log('Activities clicked')}
            onSearch={(q) => console.log('Search', q)}
            onRefresh={() => currentBucket ? fetchObjects() : fetchBuckets()}
            onUpload={() => setIsUploadOpen(true)}
            onCreateBucket={() => setIsCreateBucketOpen(true)}
            showUpload={!!currentBucket}
        />
    );

    const fileBrowser = (
        <div className="file-browser">
            <div className="quick-access-bar">
                <div className="qa-header">
                    <span className="qa-title">Quick Access</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2" fill="#9ba0b0" /><circle cx="12" cy="12" r="1.2" fill="#9ba0b0" /><circle cx="12" cy="19" r="1.2" fill="#9ba0b0" /></svg>
                </div>
                <div className="qa-cards" id="qaCards">
                    <div className="empty-state" style={{ padding: '8px 0 4px', alignItems: 'flex-start', gap: '4px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                            {currentBucket ? `Browsing bucket: ${currentBucket}` : 'Select a bucket to explore it'}
                        </div>
                    </div>
                </div>
            </div>

            {currentBucket ? (
                <>
                    <FileList
                        onAllVersions={() => { }}
                        onFilter={() => { }}
                        onRefresh={() => fetchObjects()}
                    />
                    <ObjectsTable 
                        objects={objects} 
                        onObjectClick={(key) => {
                            // TODO: Show detail panel for object
                            setIsDetailOpen(true);
                        }}
                        onObjectDownload={(key) => {
                            const token = getAuthToken();
                            const encodedBucket = encodeURIComponent(currentBucket);
                            const encodedKey = key.split('/').map(encodeURIComponent).join('/');
                            fetch(`${BASE_URL}/storage/${encodedBucket}/${encodedKey}`, {
                                headers: {
                                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                                }
                            })
                            .then(res => {
                                if (!res.ok) throw new Error("Failed to download");
                                return res.blob();
                            })
                            .then(blob => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = key.split('/').pop() || key;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                            })
                            .catch(err => {
                                setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Error', message: 'Failed to download object', type: 'error' }]);
                            });
                        }}
                        onObjectDelete={async (key) => {
                            try {
                                const encodedBucket = encodeURIComponent(currentBucket);
                                const encodedKey = key.split('/').map(encodeURIComponent).join('/');
                                await apiClient(`/storage/${encodedBucket}/${encodedKey}`, { method: 'DELETE' });
                                setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Success', message: 'Object deleted successfully!', type: 'success' }]);
                                fetchObjects();
                            } catch (err: any) {
                                setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Error', message: err.message, type: 'error' }]);
                            }
                        }}
                    />
                </>
            ) : (
                <BucketsTable buckets={buckets} onBucketClick={(name) => setCurrentBucket(name)} />
            )}
        </div>
    );

    const detailPanel = isDetailOpen ? (
        <DetailPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={() => setIsDetailOpen(false)}
        />
    ) : null;

    const modals = (
        <>
            <BucketModal
                isOpen={isCreateBucketOpen}
                onClose={() => setIsCreateBucketOpen(false)}
                onCreate={handleCreateBucket}
            />
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );

    return (
        <DashboardLayout
            sidebar={sidebar}
            topbar={topbar}
            fileBrowser={fileBrowser}
            detailPanel={detailPanel}
            modals={modals}
            toasts={<ToastContainer toasts={toasts} />}
        />
    );
};

export default Dashboard;
