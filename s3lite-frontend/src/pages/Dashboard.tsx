import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { Topbar } from '../components/Dashboard/Topbar';
import { FileList } from '../components/Dashboard/FileList';
import { BucketsTable } from '../components/Dashboard/BucketsTable';
import { DetailPanel } from '../components/Dashboard/DetailPanel';
import { BucketModal } from '../components/Dashboard/BucketModal';
import { UploadModal } from '../components/Dashboard/UploadModal';
import { DeleteModal } from '../components/Dashboard/DeleteModal';
import { ToastContainer, ToastProps } from '../components/Dashboard/ToastContainer';
import { getUsername, apiClient, removeAuthToken, removeUsername } from '../api';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'activity' | 'comments' | 'versions'>('activity');
    const [currentBucket, setCurrentBucket] = useState('');
    const [buckets, setBuckets] = useState<any[]>([]);

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

    useEffect(() => {
        if (!currentBucket) {
            fetchBuckets();
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
        try {
            await apiClient(`/storage/${currentBucket}/${key}`, {
                method: 'PUT',
                data: file,
                headers: { 'Content-Type': 'application/octet-stream' }
            });
            setIsUploadOpen(false);
            setToasts(prev => [...prev, { id: Date.now().toString(), title: 'Success', message: 'File uploaded successfully!', type: 'success' }]);
            // Trigger refresh logic if needed
            fetchBuckets(); // If it affects buckets or just objects
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
            onRefresh={() => currentBucket ? console.log("refresh objects") : fetchBuckets()}
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
                <FileList
                    onAllVersions={() => { }}
                    onFilter={() => { }}
                    onRefresh={() => { }}
                />
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
