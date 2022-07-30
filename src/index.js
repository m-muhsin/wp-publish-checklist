import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/edit-post";
import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from "@wordpress/element";
import { Icon, CheckboxControl, Modal, Button } from "@wordpress/components";
import { useSelect, useDispatch, select, dispatch } from "@wordpress/data";

import './style.scss';

const ChecklistPlugin = () => {

    const [postFields, setPostFields] = useState([]);
    const [ignore, setIgnore] = useState(false);

    const [isOpen, setOpen] = useState(false);
    const openModal = () => setOpen(true);
    const closeModal = () => setOpen(false);

    const lock = useDispatch('core/editor').lockPostSaving
    const unlock = useDispatch('core/editor').unlockPostSaving
    const publishButton = useRef(null)

    const [title, content, featured_media, excerpt, categories, tags] = useSelect((select) => {
        const getField = select('core/editor').getEditedPostAttribute
        const title = getField('title');
        const content = getField('content');
        const featured_media = getField('featured_media');
        const excerpt = getField('excerpt');
        const categories = getField('categories');
        const tags = getField('tags');
        return [title, content, featured_media, excerpt, categories, tags];
    });

    useEffect(() => {

        if (!ignore) {
            if (title === '' || content === '' || excerpt === '' || featured_media === 0 || categories.length === 0 || tags.length === 0) {
                lock();
            } else {
                unlock();
            }
        } else {
            unlock();
        }

        setPostFields([
            {
                name: 'title',
                label: 'Title',
                isPresent: title !== ''
            },
            {
                name: 'content',
                label: 'Content',
                isPresent: content !== ''
            },
            {
                name: 'excerpt',
                label: 'Excerpt',
                isPresent: excerpt !== ''
            },
            {
                name: 'featured_media',
                label: 'Featured Image',
                isPresent: featured_media !== 0
            },
            {
                name: 'categories',
                label: 'Categories',
                isPresent: categories.length !== 0
            },
            {
                name: 'tags',
                label: 'Tags',
                isPresent: tags.length !== 0
            },
        ]);
    }, [ignore, title, content, featured_media, excerpt, categories, tags]);

    useEffect(() => {

        let blockLoaded = false;
        let blockLoadedInterval = setInterval(function () {

            publishButton.current = document.querySelector('.editor-post-publish-button');

            // See if the publish button is loaded.
            if (publishButton.current) {

                blockLoaded = true;

                publishButton.current.addEventListener('click', () => {
                    if (select('core/editor').isPostSavingLocked()) {
                        dispatch("core/edit-post").openGeneralSidebar('edit-post/document');
                        dispatch("core/edit-post").openGeneralSidebar('edit-post/document');
                        openModal();
                    }
                });

            }

            if (blockLoaded) {
                clearInterval(blockLoadedInterval);
            }

        }, 500);

    }, []);

    const publishAnyway = () => {
        setIgnore(true);
        unlock();
        dispatch('core/editor').savePost()
        closeModal();
    }

    return (
        <>
            <PluginDocumentSettingPanel
                title={__("Publish Checklist", "wp-publish-checkist")}
                name="checklist-panel"
                className="checklist-panel"
                intialOpen={true}
            >
                <p>The following post fields need to be entered before you can publish:</p>
                <ul className="checklist-items">
                    {
                        postFields.map((field) => {
                            return (
                                <li key={field.name} className={field.isPresent ? 'present' : 'missing'}>
                                    <Icon icon={field.isPresent ? 'yes' : 'no'} />
                                    <span>{field.label}</span>
                                </li>
                            )
                        })
                    }
                </ul>
                <CheckboxControl
                    label={__("Ignore checklist", "wp-publish-checkist")}
                    checked={ignore}
                    onChange={(value) => {
                        setIgnore(value);
                    }}
                />
                {isOpen && (
                    <Modal title="Publish Checklist" onRequestClose={closeModal}>
                        <p>The following post fields need to be entered before you can publish:</p>
                        <ul className="checklist-items">
                            {
                                postFields.filter(field =>
                                    field.isPresent === false
                                ).map((field) => {
                                    return (
                                        <li key={field.name} className={field.isPresent ? 'present' : 'missing'}>
                                            <Icon icon={field.isPresent ? 'yes' : 'no'} />
                                            <span>{field.label}</span>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <Button className="publish-primary" variant="primary" onClick={publishAnyway}>
                            Publish Anyway
                        </Button>
                        <Button variant="secondary" onClick={closeModal}>
                            Go back
                        </Button>
                    </Modal>
                )}
            </PluginDocumentSettingPanel>
        </>
    )
}

registerPlugin('publishing-checklist', {
    icon: 'yes',
    render: () => {
        return (
            <ChecklistPlugin />
        )
    }
})
